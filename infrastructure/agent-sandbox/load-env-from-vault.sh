#!/bin/bash
# Fetches agent-sandbox secrets from Vault and exports them as shell vars —
# never written to disk. Source it (". load-env-from-vault.sh") to export
# into your current shell, or run it directly and `eval "$(...)"` the output.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../config.sh"

SOURCED=0
[[ "${BASH_SOURCE[0]}" != "${0}" ]] && SOURCED=1

emit() {
  local name=$1 value=$2
  if [ "$SOURCED" = "1" ]; then
    export "${name}=${value}"
  else
    local escaped
    escaped=$(printf '%s' "$value" | sed "s/'/'\\\\''/g")
    printf "export %s='%s'\n" "$name" "$escaped"
  fi
}

echo "Fetching root token from Secret Manager..." >&2
VAULT_TOKEN=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_ROOT_TOKEN \
  --project="${GCP_PROJECT}")

echo "Fetching agent sandbox tokens from Vault..." >&2
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
AGENT_GH_APP_ID=$(echo "$SECRETS" | jq -r '.AGENT_GH_APP_ID // empty')
AGENT_GH_APP_PRIVATE_KEY=$(echo "$SECRETS" | jq -r '.AGENT_GH_APP_PRIVATE_KEY // empty')

if [ -n "$AGENT_GH_APP_ID" ] && [ -n "$AGENT_GH_APP_PRIVATE_KEY" ]; then
  case "$AGENT_GH_APP_PRIVATE_KEY" in
    -----BEGIN*) PEM_CONTENT="$AGENT_GH_APP_PRIVATE_KEY" ;;
    *) PEM_CONTENT=$(echo "$AGENT_GH_APP_PRIVATE_KEY" | base64 -d) ;;
  esac
  echo "Minting GitHub App installation token..." >&2
  GH_TOKEN=$("${SCRIPT_DIR}/mint-github-app-token.sh" "$AGENT_GH_APP_ID" <(printf '%s\n' "$PEM_CONTENT"))
else
  GH_TOKEN=$(echo "$SECRETS" | jq -r '.AGENT_GITHUB_TOKEN // empty')
fi

if [ -z "$CLAUDE_CODE_OAUTH_TOKEN" ]; then
  echo "ERROR: CLAUDE_CODE_OAUTH_TOKEN not found in Vault (${VAULT_KV_PATH}/secrets)." >&2
  exit 1
fi
if [ "${#CLAUDE_CODE_OAUTH_TOKEN}" -lt 100 ]; then
  echo "ERROR: CLAUDE_CODE_OAUTH_TOKEN in Vault looks truncated (${#CLAUDE_CODE_OAUTH_TOKEN} chars; expected ~109). Re-copy the full 'claude setup-token' output." >&2
  exit 1
fi
if [ -z "$GH_TOKEN" ]; then
  echo "WARNING: no GitHub App credentials (AGENT_GH_APP_ID + AGENT_GH_APP_PRIVATE_KEY) or AGENT_GITHUB_TOKEN found in Vault; sandbox will have read-only git access." >&2
fi

emit CLAUDE_CODE_OAUTH_TOKEN "$CLAUDE_CODE_OAUTH_TOKEN"
emit GH_TOKEN "$GH_TOKEN"
emit AGENT_GH_APP_ID "$AGENT_GH_APP_ID"
emit AGENT_GH_APP_PRIVATE_KEY "$AGENT_GH_APP_PRIVATE_KEY"

if [ -n "${SANDBOX_VAULT_ENV_VARS:-}" ]; then
  echo "Injecting extra Vault secrets: ${SANDBOX_VAULT_ENV_VARS}" >&2
  IFS=',' read -ra EXTRA_VAR_NAMES <<<"${SANDBOX_VAULT_ENV_VARS}"
  for VAR_NAME in "${EXTRA_VAR_NAMES[@]}"; do
    VAR_NAME=$(echo "$VAR_NAME" | xargs)
    [ -z "$VAR_NAME" ] && continue
    VAR_VALUE=$(echo "$SECRETS" | jq -r --arg key "$VAR_NAME" '.[$key] // empty')
    if [ -z "$VAR_VALUE" ]; then
      echo "WARNING: ${VAR_NAME} not found in Vault (${VAULT_KV_PATH}/secrets); skipping." >&2
      continue
    fi
    emit "$VAR_NAME" "$VAR_VALUE"
  done
fi

echo "✓ Loaded agent sandbox secrets (session only — nothing written to disk)" >&2
