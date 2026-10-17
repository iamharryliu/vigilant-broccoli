#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"
source "${SCRIPT_DIR}/lib/vault-ops-token.sh"
source "${SCRIPT_DIR}/../../../lib/ssh-secrets.sh"

fetch_vault_ops_credentials
OLD_SECRET_ID="$VAULT_OPS_SECRET_ID"

echo "Minting new ${VAULT_OPS_ROLE_NAME} secret_id..."
NEW_SECRET_ID=$(vault_ops_ssh '
vault write -f -field=secret_id auth/approle/role/'"${VAULT_OPS_ROLE_NAME}"'/secret-id
' 2>/dev/null | tr -d '[:space:]')
require_value "${VAULT_OPS_ROLE_NAME} secret_id" "$NEW_SECRET_ID"

echo "Storing new secret_id in Secret Manager..."
echo -n "$NEW_SECRET_ID" | gcloud secrets versions add "${VAULT_OPS_SECRET_ID_SECRET}" \
  --data-file=- --project="${GCP_PROJECT}"

# Logging in with the new secret_id verifies it before the old one is destroyed.
echo "Verifying new secret_id and destroying the previous one..."
VAULT_OPS_SECRET_ID="$NEW_SECRET_ID"
vault_ops_ssh '
printf "%s" "$OLD_SECRET_ID" | vault write auth/approle/role/'"${VAULT_OPS_ROLE_NAME}"'/secret-id/destroy secret_id=- >/dev/null
' OLD_SECRET_ID "$OLD_SECRET_ID"

echo "✓ ${VAULT_OPS_ROLE_NAME} secret_id rotated successfully"
