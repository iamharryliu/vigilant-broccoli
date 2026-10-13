#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../config.sh"
source "${SCRIPT_DIR}/../lib/ssh-secrets.sh"

USAGE="Usage: pnpm vault:store-promotion-key <path-to-pem>"
KEY_FILE="${1:-}"
if [ -z "$KEY_FILE" ] || [ ! -f "$KEY_FILE" ]; then
  echo "$USAGE" >&2
  exit 1
fi

openssl pkey -in "$KEY_FILE" -noout >/dev/null
APP_KEY=$(base64 < "$KEY_FILE" | tr -d '\n')
VAULT_TOKEN=$(gcloud secrets versions access latest --secret=VB_VM_VAULT_ROOT_TOKEN --project="$GCP_PROJECT")

gcloud_ssh_secrets "$VM_NAME" "$GCP_ZONE" '
set -euo pipefail
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
printf "%s" "$APP_KEY" | jq -Rs "{PRODUCTION_PROMOTION_GH_APP_PRIVATE_KEY: .}" | vault kv put '"${VAULT_KV_PATH}"'/production-promotion - >/dev/null
' VAULT_TOKEN "$VAULT_TOKEN" APP_KEY "$APP_KEY"
echo "Stored the production-promotion App key in ${VAULT_KV_PATH}/production-promotion."
