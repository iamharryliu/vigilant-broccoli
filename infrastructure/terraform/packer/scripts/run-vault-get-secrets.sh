#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"
source "${SCRIPT_DIR}/lib/vault-ops-token.sh"
source "${SCRIPT_DIR}/../../../lib/ssh-secrets.sh"

OUTPUT_FILE="$HOME/Desktop/vault-secrets.json"

fetch_vault_ops_credentials

echo "Fetching secrets from Vault..."
SECRETS=$(gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
set -e
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
VAULT_TOKEN=$(vault write -field=token auth/approle/login role_id="$VAULT_OPS_ROLE_ID" secret_id="$VAULT_OPS_SECRET_ID")
export VAULT_TOKEN

vault kv get -format=json '"${VAULT_KV_PATH}"'/secrets | jq ".data.data"
' VAULT_OPS_ROLE_ID "$VAULT_OPS_ROLE_ID" VAULT_OPS_SECRET_ID "$VAULT_OPS_SECRET_ID")

echo "$SECRETS" > "$OUTPUT_FILE"
echo "Secrets saved to $OUTPUT_FILE"
