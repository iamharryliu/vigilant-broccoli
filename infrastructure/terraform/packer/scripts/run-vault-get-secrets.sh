#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"
source "${SCRIPT_DIR}/lib/vault-ops-token.sh"

OUTPUT_FILE="$HOME/Desktop/vault-secrets.json"

fetch_vault_ops_credentials

echo "Fetching secrets from Vault..."
SECRETS=$(printf '%s\n%s\n' "$VAULT_OPS_ROLE_ID" "$VAULT_OPS_SECRET_ID" | gcloud compute ssh "${VM_NAME}" \
  --zone="${GCP_ZONE}" \
  --tunnel-through-iap \
  --command="
set -e
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt

read -r ROLE_ID
read -r SECRET_ID
VAULT_TOKEN=\$(vault write -field=token auth/approle/login role_id=\"\$ROLE_ID\" secret_id=\"\$SECRET_ID\")
export VAULT_TOKEN

vault kv get -format=json ${VAULT_KV_PATH}/secrets | jq '.data.data'
")

echo "$SECRETS" > "$OUTPUT_FILE"
echo "Secrets saved to $OUTPUT_FILE"
