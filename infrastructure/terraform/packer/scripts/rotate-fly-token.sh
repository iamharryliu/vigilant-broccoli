#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"
source "${SCRIPT_DIR}/../../../lib/ssh-secrets.sh"

echo "Fetching root token from Secret Manager..."
VAULT_TOKEN=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_ROOT_TOKEN \
  --project="${GCP_PROJECT}")

echo "Capturing currently active token IDs..."
OLD_TOKEN_IDS=$(fly tokens list --scope org --org personal | awk -F'│' '
NR > 1 && NF >= 5 {
  id = $1; revoked = $5
  gsub(/[[:space:]]/, "", id); gsub(/[[:space:]]/, "", revoked)
  if (id != "" && revoked == "") print id
}')
echo "Found $(echo "$OLD_TOKEN_IDS" | grep -c . || true) active token(s)"

echo "Creating new Fly.io organization token..."
NEW_TOKEN=$(fly tokens create org -n vb-deploy-token -o personal 2>&1 | grep -o 'fm2_[^ ]*' | head -1)

if [ -z "$NEW_TOKEN" ]; then
  echo "ERROR: Failed to create new Fly.io token"
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

vault kv patch '"${VAULT_KV_PATH}"'/secrets FLY_API_TOKEN="$NEW_TOKEN"
' VAULT_TOKEN "$VAULT_TOKEN" NEW_TOKEN "$NEW_TOKEN"

echo "Revoking previous tokens..."
for TOKEN_ID in $OLD_TOKEN_IDS; do
  echo "Revoking token (ID: $TOKEN_ID)..."
  fly tokens revoke "$TOKEN_ID"
done

echo "✓ Fly.io token rotated successfully"
