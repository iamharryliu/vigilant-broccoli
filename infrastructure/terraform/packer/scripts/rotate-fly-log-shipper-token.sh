#!/bin/bash
# Rotates the read-only Fly org token vb-log-shipper uses to subscribe to the
# org NATS log stream. rotate-fly-token.sh leaves it alone (it only revokes
# vb-deploy-token), so it is rotated here: mint, verify, write to Vault,
# redeploy the shipper (which fails unless Vector stays up on the new token),
# and only then revoke the previous ones, so a failed step keeps the old token
# working.
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../.." && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"
source "${SCRIPT_DIR}/../../../lib/ssh-secrets.sh"

TOKEN_NAME="vb-log-shipper-readonly"

echo "Fetching root token from Secret Manager..."
VAULT_TOKEN=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_ROOT_TOKEN \
  --project="${GCP_PROJECT}")

echo "Capturing currently active ${TOKEN_NAME} IDs..."
OLD_TOKEN_IDS=$(fly tokens list --scope org --org personal | awk -F'│' -v name="$TOKEN_NAME" '
NR > 1 && NF >= 5 {
  id = $1; tname = $2; revoked = $5
  gsub(/[[:space:]]/, "", id); gsub(/[[:space:]]/, "", tname); gsub(/[[:space:]]/, "", revoked)
  if (id != "" && tname == name && revoked == "") print id
}')
echo "Found $(echo "$OLD_TOKEN_IDS" | grep -c . || true) active ${TOKEN_NAME} token(s)"

echo "Creating new read-only Fly.io organization token..."
NEW_TOKEN=$(fly tokens create readonly -n "$TOKEN_NAME" -o personal 2>&1 | grep -o 'fm2_[^ ]*' | head -1)

if [ -z "$NEW_TOKEN" ]; then
  echo "ERROR: Failed to create new read-only Fly.io token"
  exit 1
fi

echo "Verifying new token..."
if ! fly apps list --access-token "$NEW_TOKEN" > /dev/null; then
  echo "ERROR: New token failed verification; old tokens left untouched"
  exit 1
fi

echo "Updating Vault with new token..."
gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt

vault kv patch '"${VAULT_KV_PATH}"'/secrets FLY_LOG_SHIPPER_ACCESS_TOKEN="$NEW_TOKEN" >/dev/null
' VAULT_TOKEN "$VAULT_TOKEN" NEW_TOKEN "$NEW_TOKEN"

echo "Redeploying vb-log-shipper with the new token..."
(cd "$REPO_ROOT" && pnpm logs:shipper:deploy)

echo "Revoking previous ${TOKEN_NAME} tokens..."
for TOKEN_ID in $OLD_TOKEN_IDS; do
  echo "Revoking token (ID: $TOKEN_ID)..."
  fly tokens revoke "$TOKEN_ID"
done

echo "✓ Fly log shipper token rotated successfully"
