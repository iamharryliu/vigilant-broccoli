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

KV_JSON=$(jq -c 'if type == "object" and length > 0 then . else error("expected a non-empty JSON object") end' "$SECRETS_FILE" 2>/dev/null) || {
  echo "ERROR: Failed to parse JSON from $SECRETS_FILE"
  exit 1
}

fetch_vault_ops_credentials

# The payload is piped to `vault kv put ... -` as JSON on stdin, keeping every
# secret value off the remote vault process argv.
echo "Setting secrets in Vault..."
vault_ops_ssh '
printf "%s" "$KV_JSON" | vault kv put '"${VAULT_KV_PATH}"'/secrets -

echo "Secrets set successfully."
' KV_JSON "$KV_JSON"
