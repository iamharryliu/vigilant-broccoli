#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"
source "${SCRIPT_DIR}/../../../lib/ssh-secrets.sh"

OUTPUT_FILE="$HOME/Desktop/vault-secrets.json"

echo "Fetching root token from Secret Manager..."
VAULT_TOKEN=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_ROOT_TOKEN \
  --project="${GCP_PROJECT}")

echo "Fetching secrets from Vault..."
SECRETS=$(gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt

vault kv get -format=json '"${VAULT_KV_PATH}"'/secrets | jq ".data.data"
' VAULT_TOKEN "$VAULT_TOKEN")

echo "$SECRETS" > "$OUTPUT_FILE"
echo "Secrets saved to $OUTPUT_FILE"
