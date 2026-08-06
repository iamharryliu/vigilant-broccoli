#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTAINER=vb-agent-sandbox
source "${SCRIPT_DIR}/../config.sh"
source "${SCRIPT_DIR}/../lib/ssh-secrets.sh"

if [ -n "${1:-}" ]; then
  NEW_TOKEN="$1"
else
  read -rsp "Paste new Claude Code OAuth token (from 'claude setup-token'): " NEW_TOKEN
  echo >&2
fi

if [ -z "$NEW_TOKEN" ]; then
  echo "Usage: pnpm agentic:dev-sandbox:refresh-claude-token [token]" >&2
  echo "  Run 'claude setup-token' yourself first (interactive OAuth login), then either" >&2
  echo "  pass its output as an argument or paste it at the prompt." >&2
  exit 1
fi
if [ "${#NEW_TOKEN}" -lt 100 ]; then
  echo "ERROR: token looks truncated (${#NEW_TOKEN} chars; expected ~109). Re-copy the full 'claude setup-token' output." >&2
  exit 1
fi

echo "Fetching root token from Secret Manager..." >&2
VAULT_TOKEN=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_ROOT_TOKEN \
  --project="${GCP_PROJECT}")

echo "Patching CLAUDE_CODE_OAUTH_TOKEN in Vault..." >&2
gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt

vault kv patch '"${VAULT_KV_PATH}"'/secrets CLAUDE_CODE_OAUTH_TOKEN="$NEW_TOKEN"
' VAULT_TOKEN "$VAULT_TOKEN" NEW_TOKEN "$NEW_TOKEN"

echo "✓ CLAUDE_CODE_OAUTH_TOKEN updated in Vault." >&2

if docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "Recreating running dev-sandbox container with refreshed Vault secrets..." >&2
  # Reload everything (not just CLAUDE_CODE_OAUTH_TOKEN) so GH_TOKEN/AGENT_GH_APP_ID
  # aren't silently dropped from the recreated container's env — they're unrelated
  # credentials but docker-compose.yml only sees vars exported in *this* shell.
  . "${SCRIPT_DIR}/load-env-from-vault.sh"
  docker compose -f "${SCRIPT_DIR}/docker-compose.yml" up -d --force-recreate agent-sandbox
  echo "✓ ${CONTAINER} recreated with the refreshed token." >&2
else
  echo "${CONTAINER} is not running — the refreshed token will apply on the next 'pnpm agentic:dev-sandbox:up'." >&2
fi
