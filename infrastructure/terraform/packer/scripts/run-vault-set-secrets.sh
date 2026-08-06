#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"
source "${SCRIPT_DIR}/lib/vault-ops-token.sh"
source "${SCRIPT_DIR}/../../../lib/ssh-secrets.sh"

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

KV_ARGS=$(jq -r 'to_entries | map("\(.key)=\"\(.value)\"") | join(" ")' "$SECRETS_FILE" 2>/dev/null)

if [ $? -ne 0 ] || [ -z "$KV_ARGS" ]; then
  echo "ERROR: Failed to parse JSON from $SECRETS_FILE"
  exit 1
fi

fetch_vault_ops_credentials

echo "Setting secrets in Vault..."
gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
set -e
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
VAULT_TOKEN=$(vault write -field=token auth/approle/login role_id="$VAULT_OPS_ROLE_ID" secret_id="$VAULT_OPS_SECRET_ID")
export VAULT_TOKEN

eval "vault kv put '"${VAULT_KV_PATH}"'/secrets $KV_ARGS"

echo "Secrets set successfully."
' VAULT_OPS_ROLE_ID "$VAULT_OPS_ROLE_ID" VAULT_OPS_SECRET_ID "$VAULT_OPS_SECRET_ID" KV_ARGS "$KV_ARGS"
