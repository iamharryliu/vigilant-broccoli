#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"
source "${SCRIPT_DIR}/lib/vault-ops-token.sh"

SECRETS_FILE="$HOME/Desktop/vault-secrets.json"

if [ ! -f "$SECRETS_FILE" ]; then
  echo "ERROR: Secrets file not found: $SECRETS_FILE"
  exit 1
fi

if ! command -v jq &> /dev/null; then
  echo "ERROR: jq is required but not installed"
  exit 1
fi

if ! jq empty "$SECRETS_FILE" 2>/dev/null; then
  echo "ERROR: Failed to parse JSON from $SECRETS_FILE"
  exit 1
fi

fetch_vault_ops_credentials

echo "Setting secrets in Vault..."
{ printf '%s\n%s\n' "$VAULT_OPS_ROLE_ID" "$VAULT_OPS_SECRET_ID"; cat "$SECRETS_FILE"; } | gcloud compute ssh "${VM_NAME}" \
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

vault kv put ${VAULT_KV_PATH}/secrets @-

echo 'Secrets set successfully.'
"
