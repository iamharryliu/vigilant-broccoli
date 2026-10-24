#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"
source "${SCRIPT_DIR}/lib/vault-ops-token.sh"
source "${SCRIPT_DIR}/../../../lib/ssh-secrets.sh"

OUTPUT_FILE="$HOME/Desktop/vault-secrets.json"

fetch_vault_ops_credentials

echo "Fetching secrets from Vault..."
SECRETS=$(vault_ops_ssh '
vault kv get -format=json '"${VAULT_KV_PATH}"'/secrets | jq ".data.data"
')

echo "$SECRETS" > "$OUTPUT_FILE"
echo "Secrets saved to $OUTPUT_FILE"
