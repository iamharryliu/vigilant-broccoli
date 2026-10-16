#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../config.sh"
source "${SCRIPT_DIR}/../lib/ssh-secrets.sh"
source "${SCRIPT_DIR}/../terraform/packer/scripts/lib/vault-ops-token.sh"

USAGE="Usage: pnpm vault:store-promotion-key <path-to-pem>"
KEY_FILE="${1:-}"
if [ -z "$KEY_FILE" ] || [ ! -f "$KEY_FILE" ]; then
  echo "$USAGE" >&2
  exit 1
fi

openssl pkey -in "$KEY_FILE" -noout >/dev/null
APP_KEY=$(base64 < "$KEY_FILE" | tr -d '\n')
fetch_vault_ops_credentials

vault_ops_ssh '
set -euo pipefail
printf "%s" "$APP_KEY" | jq -Rs "{PRODUCTION_PROMOTION_GH_APP_PRIVATE_KEY: .}" | vault kv put '"${VAULT_KV_PATH}"'/production-promotion - >/dev/null
' APP_KEY "$APP_KEY"
echo "Stored the production-promotion App key in ${VAULT_KV_PATH}/production-promotion."
