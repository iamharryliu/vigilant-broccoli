#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"

RESEND_API="https://api.resend.com"
KEY_NAME="vb-ci-$(date +%Y%m%d%H%M%S)"
KEY_PERMISSION="full_access"
FLY_APP="vb-email-service"

# CI mode (VAULT_ADDR set by the rotate-secrets workflow): current key and
# VAULT_TOKEN come from the vault-secrets action, Vault is reached through the
# Cloudflare Access tunnel. Local mode: both go through gcloud + IAP SSH.
if [ -z "$VAULT_ADDR" ]; then
  echo "Fetching root token from Secret Manager..."
  VAULT_TOKEN=$(gcloud secrets versions access latest \
    --secret=VB_VM_VAULT_ROOT_TOKEN \
    --project="${GCP_PROJECT}")

  echo "Reading current Resend key from Vault..."
  CURRENT_KEY=$(gcloud compute ssh "${VM_NAME}" \
    --zone="${GCP_ZONE}" \
    --tunnel-through-iap \
    --command="
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
export VAULT_TOKEN='${VAULT_TOKEN}'
vault kv get -field=RESEND_API_KEY ${VAULT_KV_PATH}/secrets
" 2>/dev/null | tr -d '[:space:]')
else
  CURRENT_KEY="$RESEND_API_KEY"
fi

if [ -z "$CURRENT_KEY" ]; then
  echo "ERROR: current RESEND_API_KEY not available"
  exit 1
fi

echo "Minting successor key (${KEY_NAME})..."
CREATE=$(curl -sf -X POST "${RESEND_API}/api-keys" \
  -H "Authorization: Bearer ${CURRENT_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"${KEY_NAME}\",\"permission\":\"${KEY_PERMISSION}\"}")
NEW_ID=$(jq -r '.id // empty' <<< "$CREATE")
NEW_KEY=$(jq -r '.token // empty' <<< "$CREATE")

if [ -z "$NEW_KEY" ]; then
  echo "ERROR: Failed to mint successor key"
  exit 1
fi

echo "Verifying new key..."
if ! curl -sf -o /dev/null -H "Authorization: Bearer ${NEW_KEY}" "${RESEND_API}/api-keys"; then
  echo "ERROR: New key failed verification; old key left untouched"
  exit 1
fi

echo "Updating Vault with new key..."
if [ -z "$VAULT_ADDR" ]; then
  gcloud compute ssh "${VM_NAME}" \
    --zone="${GCP_ZONE}" \
    --tunnel-through-iap \
    --command="
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
export VAULT_TOKEN='${VAULT_TOKEN}'

vault kv patch ${VAULT_KV_PATH}/secrets RESEND_API_KEY='${NEW_KEY}'
"
else
  curl -sf -o /dev/null \
    -H "CF-Access-Client-Id: ${CF_ACCESS_CLIENT_ID}" \
    -H "CF-Access-Client-Secret: ${CF_ACCESS_CLIENT_SECRET}" \
    -H "X-Vault-Token: ${VAULT_TOKEN}" \
    -X PATCH -H "Content-Type: application/merge-patch+json" \
    -d "{\"data\":{\"RESEND_API_KEY\":\"${NEW_KEY}\"}}" \
    "${VAULT_ADDR}/v1/${VAULT_KV_PATH}/data/secrets"
fi

echo "Pushing new key to ${FLY_APP} (rolling restart)..."
flyctl secrets set --app "${FLY_APP}" RESEND_API_KEY="${NEW_KEY}"

echo "Deleting all other Resend keys (single-key policy)..."
OLD_IDS=$(curl -sf -H "Authorization: Bearer ${NEW_KEY}" "${RESEND_API}/api-keys" \
  | jq -r --arg new "$NEW_ID" '.data[] | select(.id != $new) | .id')
for KEY_ID in $OLD_IDS; do
  echo "Deleting key (ID: ${KEY_ID})..."
  curl -sf -o /dev/null -X DELETE -H "Authorization: Bearer ${NEW_KEY}" "${RESEND_API}/api-keys/${KEY_ID}"
done

REMAINING=$(curl -sf -H "Authorization: Bearer ${NEW_KEY}" "${RESEND_API}/api-keys" | jq '.data | length')
echo "✓ Resend key rotated successfully (${REMAINING} key active)"
