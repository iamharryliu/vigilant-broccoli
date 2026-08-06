#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"
source "${SCRIPT_DIR}/lib/vault-ops-token.sh"
source "${SCRIPT_DIR}/../../../lib/ssh-secrets.sh"

echo "Verifying ${VAULT_OPS_ROLE_NAME} can mint a working token before revoking root..."
fetch_vault_ops_credentials
gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
set -e
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
VAULT_TOKEN=$(vault write -field=token auth/approle/login role_id="$VAULT_OPS_ROLE_ID" secret_id="$VAULT_OPS_SECRET_ID")
export VAULT_TOKEN

vault token lookup >/dev/null
echo "'"${VAULT_OPS_ROLE_NAME}"' token verified."
' VAULT_OPS_ROLE_ID "$VAULT_OPS_ROLE_ID" VAULT_OPS_SECRET_ID "$VAULT_OPS_SECRET_ID"

echo "Fetching root token from Secret Manager..."
VAULT_TOKEN=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_ROOT_TOKEN \
  --project="${GCP_PROJECT}")

echo "Revoking Vault root token..."
gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
set -e
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt

vault token revoke -self
' VAULT_TOKEN "$VAULT_TOKEN"

echo "✓ Root token revoked. Recovery keys in VB_VM_VAULT_UNSEAL_KEYS remain valid — use 'vault operator generate-root' if a root token is ever needed again."
