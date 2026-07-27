#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"
source "${SCRIPT_DIR}/../../../lib/ssh-secrets.sh"

TWILIO_ACCOUNTS_API="https://accounts.twilio.com/v1"
TWILIO_API="https://api.twilio.com/2010-04-01"
FLY_APPS=(staging-vb-express production-vb-express)

# CI mode (VAULT_ADDR set by the rotate-secrets workflow): current credentials
# and VAULT_TOKEN come from the vault-secrets action, Vault is reached through
# the Cloudflare Access tunnel. Local mode: both go through gcloud + IAP SSH.
if [ -z "$VAULT_ADDR" ]; then
  echo "Fetching root token from Secret Manager..."
  VAULT_TOKEN=$(gcloud secrets versions access latest \
    --secret=VB_VM_VAULT_ROOT_TOKEN \
    --project="${GCP_PROJECT}")

  echo "Reading current Twilio credentials from Vault..."
  CREDS=$(gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
echo "SID=$(vault kv get -field=TWILIO_ACCOUNT_SID '"${VAULT_KV_PATH}"'/secrets)"
echo "TOKEN=$(vault kv get -field=TWILIO_AUTH_TOKEN '"${VAULT_KV_PATH}"'/secrets)"
' VAULT_TOKEN "$VAULT_TOKEN" 2>/dev/null)
  ACCOUNT_SID=$(awk -F= '/^SID=/{print $2}' <<< "$CREDS" | tr -d '[:space:]')
  CURRENT_TOKEN=$(awk -F= '/^TOKEN=/{print $2}' <<< "$CREDS" | tr -d '[:space:]')
else
  ACCOUNT_SID="$TWILIO_ACCOUNT_SID"
  CURRENT_TOKEN="$TWILIO_AUTH_TOKEN"
fi

if [ -z "$ACCOUNT_SID" ] || [ -z "$CURRENT_TOKEN" ]; then
  echo "ERROR: current Twilio credentials not available"
  exit 1
fi

echo "Minting secondary auth token..."
CREATE=$(curl -sf -X POST -u "${ACCOUNT_SID}:${CURRENT_TOKEN}" "${TWILIO_ACCOUNTS_API}/AuthTokens/Secondary")
NEW_TOKEN=$(jq -r '.secondary_auth_token // empty' <<< "$CREATE")

if [ -z "$NEW_TOKEN" ]; then
  echo "ERROR: Failed to mint secondary auth token"
  exit 1
fi

echo "Verifying secondary auth token..."
if ! curl -sf -o /dev/null -u "${ACCOUNT_SID}:${NEW_TOKEN}" "${TWILIO_API}/Accounts/${ACCOUNT_SID}.json"; then
  echo "ERROR: Secondary auth token failed verification; primary token left untouched"
  exit 1
fi

echo "Updating Vault with secondary auth token..."
if [ -z "$VAULT_ADDR" ]; then
  gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt

vault kv patch '"${VAULT_KV_PATH}"'/secrets TWILIO_AUTH_TOKEN="$NEW_TOKEN"
' VAULT_TOKEN "$VAULT_TOKEN" NEW_TOKEN "$NEW_TOKEN"
else
  curl -sf -o /dev/null \
    -H "CF-Access-Client-Id: ${CF_ACCESS_CLIENT_ID}" \
    -H "CF-Access-Client-Secret: ${CF_ACCESS_CLIENT_SECRET}" \
    -H "X-Vault-Token: ${VAULT_TOKEN}" \
    -X PATCH -H "Content-Type: application/merge-patch+json" \
    -d "{\"data\":{\"TWILIO_AUTH_TOKEN\":\"${NEW_TOKEN}\"}}" \
    "${VAULT_ADDR}/v1/${VAULT_KV_PATH}/data/secrets"
fi

echo "Pushing secondary auth token to Fly apps (Twilio accepts primary and secondary during the overlap)..."
for APP in "${FLY_APPS[@]}"; do
  printf 'TWILIO_AUTH_TOKEN=%s\n' "${NEW_TOKEN}" | flyctl secrets import --app "${APP}"
done

# Promote deletes the old primary and makes the secondary (already deployed
# above) the new primary — the token value doesn't change, only its role
# does, so this is the "revoke" step rather than a re-mint.
echo "Promoting secondary auth token to primary (revokes the old primary)..."
PROMOTE=$(curl -sf -X POST -u "${ACCOUNT_SID}:${NEW_TOKEN}" "${TWILIO_ACCOUNTS_API}/AuthTokens/Promote")
PROMOTED_TOKEN=$(jq -r '.auth_token // empty' <<< "$PROMOTE")

if [ "$PROMOTED_TOKEN" != "$NEW_TOKEN" ]; then
  echo "ERROR: Promote response did not confirm the expected token; check Twilio console"
  exit 1
fi

echo "✓ Twilio auth token rotated successfully"
