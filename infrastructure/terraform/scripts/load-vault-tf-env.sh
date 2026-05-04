#!/bin/bash
set -e

VM_NAME="vb-free-vm"
VM_ZONE="us-east1-b"
GCP_PROJECT="vigilant-broccoli"
KV_PATH="kv"

VAULT_TOKEN=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_ROOT_TOKEN \
  --project="${GCP_PROJECT}")

SECRETS=$(gcloud compute ssh "${VM_NAME}" \
  --zone="${VM_ZONE}" \
  --tunnel-through-iap \
  --command="
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
export VAULT_TOKEN='${VAULT_TOKEN}'

vault kv get -format=json ${KV_PATH}/secrets | jq -r '.data.data'
")

KEY_MAP=(
  "CLOUDFLARE_API_TOKEN:CLOUDFLARE_API_TOKEN"
  "GITHUB_TOKEN:GITHUB_TOKEN"
)

for mapping in "${KEY_MAP[@]}"; do
  VAULT_KEY="${mapping%%:*}"
  ENV_VAR="${mapping##*:}"
  VALUE=$(echo "$SECRETS" | jq -r --arg key "$VAULT_KEY" '.[$key] // empty')
  if [ -n "$VALUE" ]; then
    echo "export ${ENV_VAR}=\"${VALUE}\""
  fi
done
