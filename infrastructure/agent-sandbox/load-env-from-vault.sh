#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../config.sh"

ENV_FILE="${SCRIPT_DIR}/.env"

existing_value() {
  grep "^$1=" "$ENV_FILE" 2>/dev/null | cut -d= -f2-
}

SANDBOX_FIREWALL_VALUE=$(existing_value SANDBOX_FIREWALL)
SANDBOX_ALLOWED_DOMAINS_VALUE=$(existing_value SANDBOX_ALLOWED_DOMAINS)

echo "Fetching root token from Secret Manager..."
VAULT_TOKEN=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_ROOT_TOKEN \
  --project="${GCP_PROJECT}")

echo "Fetching agent sandbox tokens from Vault..."
SECRETS=$(gcloud compute ssh "${VM_NAME}" \
  --zone="${GCP_ZONE}" \
  --tunnel-through-iap \
  --command="
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
export VAULT_TOKEN='${VAULT_TOKEN}'

vault kv get -format=json ${VAULT_KV_PATH}/secrets | jq '.data.data'
")

CLAUDE_CODE_OAUTH_TOKEN=$(echo "$SECRETS" | jq -r '.CLAUDE_CODE_OAUTH_TOKEN // empty')
GH_TOKEN=$(echo "$SECRETS" | jq -r '.GH_TOKEN // empty')

if [ -z "$CLAUDE_CODE_OAUTH_TOKEN" ]; then
  echo "ERROR: CLAUDE_CODE_OAUTH_TOKEN not found in Vault (${VAULT_KV_PATH}/secrets)." >&2
  exit 1
fi
if [ "${#CLAUDE_CODE_OAUTH_TOKEN}" -lt 100 ]; then
  echo "ERROR: CLAUDE_CODE_OAUTH_TOKEN in Vault looks truncated (${#CLAUDE_CODE_OAUTH_TOKEN} chars; expected ~109). Re-copy the full 'claude setup-token' output." >&2
  exit 1
fi
if [ -z "$GH_TOKEN" ]; then
  echo "WARNING: GH_TOKEN not found in Vault; sandbox will have read-only git access." >&2
fi

cat > "$ENV_FILE" <<EOF
CLAUDE_CODE_OAUTH_TOKEN=${CLAUDE_CODE_OAUTH_TOKEN}
GH_TOKEN=${GH_TOKEN}
SANDBOX_FIREWALL=${SANDBOX_FIREWALL_VALUE:-on}
SANDBOX_ALLOWED_DOMAINS=${SANDBOX_ALLOWED_DOMAINS_VALUE}
EOF
chmod 600 "$ENV_FILE"
echo "✓ Wrote ${ENV_FILE} from Vault"
