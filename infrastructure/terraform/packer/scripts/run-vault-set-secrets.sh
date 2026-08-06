#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"
source "${SCRIPT_DIR}/../../../lib/ssh-secrets.sh"

SECRETS_FILE="$HOME/Desktop/vault-secrets.json"

if [ ! -f "$SECRETS_FILE" ]; then
  echo "ERROR: Secrets file not found: $SECRETS_FILE"
  exit 1
fi

echo "Fetching root token from Secret Manager..."
VAULT_TOKEN=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_ROOT_TOKEN \
  --project="${GCP_PROJECT}")

echo "Building vault kv put command from $SECRETS_FILE..."

if ! command -v jq &> /dev/null; then
  echo "ERROR: jq is required but not installed"
  exit 1
fi

KV_ARGS=$(jq -r 'to_entries | map("\(.key)=\"\(.value)\"") | join(" ")' "$SECRETS_FILE" 2>/dev/null)

if [ $? -ne 0 ] || [ -z "$KV_ARGS" ]; then
  echo "ERROR: Failed to parse JSON from $SECRETS_FILE"
  exit 1
fi

echo "Setting secrets in Vault..."
gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt

eval "vault kv put '"${VAULT_KV_PATH}"'/secrets $KV_ARGS"

echo "Secrets set successfully."
' VAULT_TOKEN "$VAULT_TOKEN" KV_ARGS "$KV_ARGS"
