#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"
source "${SCRIPT_DIR}/lib/vault-ops-token.sh"
source "${SCRIPT_DIR}/../../../lib/ssh-secrets.sh"

echo "Verifying ${VAULT_OPS_ROLE_NAME} can mint a working token before revoking root..."
fetch_vault_ops_credentials
vault_ops_ssh '
vault token lookup >/dev/null
vault token capabilities auth/approle/role/'"${VAULT_OPS_ROLE_NAME}"'/secret-id | grep -q update || {
  echo "ERROR: '"${VAULT_OPS_POLICY_NAME}"' cannot mint secret_ids yet — re-run pnpm gcp:vm:post-init first, or the 90d secret_id cannot be rotated without root." >&2
  exit 1
}
echo "'"${VAULT_OPS_ROLE_NAME}"' token verified."
'

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
echo "The ${VAULT_OPS_ROLE_NAME} secret_id expires after 90d — rotate it before then with pnpm secret-rotation:vault-ops."
