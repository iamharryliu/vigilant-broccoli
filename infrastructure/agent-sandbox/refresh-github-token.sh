#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTAINER=vb-agent-sandbox

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "ERROR: ${CONTAINER} is not running — start it with: pnpm agentic:dev-sandbox:up" >&2
  exit 1
fi

echo "Minting a fresh GitHub App installation token and recreating the sandbox with it..." >&2
# GH_TOKEN is never stored in Vault — load-env-from-vault.sh mints a new 1-hour
# installation token from AGENT_GH_APP_ID/AGENT_GH_APP_PRIVATE_KEY on every call,
# so reloading + recreating is the whole refresh (no Vault write needed).
. "${SCRIPT_DIR}/load-env-from-vault.sh"
docker compose -f "${SCRIPT_DIR}/docker-compose.yml" up -d --force-recreate agent-sandbox

echo "✓ ${CONTAINER} recreated with a fresh 1-hour GitHub token." >&2
