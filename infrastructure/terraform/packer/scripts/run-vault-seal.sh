#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"
source "${SCRIPT_DIR}/lib/vault-ops-token.sh"
source "${SCRIPT_DIR}/../../../lib/ssh-secrets.sh"

fetch_vault_ops_credentials

echo "Sealing Vault..."
gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
set -e
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
VAULT_TOKEN=$(vault write -field=token auth/approle/login role_id="$VAULT_OPS_ROLE_ID" secret_id="$VAULT_OPS_SECRET_ID")
export VAULT_TOKEN

vault operator seal

if vault status 2>&1 | grep -q "Sealed.*true"; then
  echo "Vault sealed successfully."
else
  echo "ERROR: Vault is still unsealed."
  exit 1
fi
' VAULT_OPS_ROLE_ID "$VAULT_OPS_ROLE_ID" VAULT_OPS_SECRET_ID "$VAULT_OPS_SECRET_ID"
