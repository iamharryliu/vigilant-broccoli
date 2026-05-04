#!/bin/bash
set -e

VM_NAME="vb-free-vm"
VM_ZONE="us-east1-b"
GCP_PROJECT="vigilant-broccoli"
SECRETS_FILE="$HOME/Desktop/vault-secrets.json"
KV_PATH="kv"

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
gcloud compute ssh "${VM_NAME}" \
  --zone="${VM_ZONE}" \
  --tunnel-through-iap \
  --command="
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
export VAULT_TOKEN='${VAULT_TOKEN}'

vault kv put ${KV_PATH}/secrets ${KV_ARGS}

echo 'Secrets set successfully.'
"
