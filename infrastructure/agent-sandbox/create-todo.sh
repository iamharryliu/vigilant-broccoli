#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
IMAGE=vb-agent-sandbox

MODEL=sonnet
ARGS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --model)
      MODEL=$2
      shift 2
      ;;
    *)
      ARGS+=("$1")
      shift
      ;;
  esac
done

DESCRIPTION="${ARGS[*]:-}"
if [ -z "$DESCRIPTION" ]; then
  echo "Usage: pnpm agentic:task:create [--model <model>] <description>" >&2
  exit 1
fi

if ! docker image inspect "$IMAGE" >/dev/null 2>&1; then
  docker compose -f "$SCRIPT_DIR/docker-compose.yml" build
fi

if [ ! -f "$ENV_FILE" ]; then
  "$SCRIPT_DIR/load-env-from-vault.sh"
fi

GH_TOKEN_VALUE=$(grep '^GH_TOKEN=' "$ENV_FILE" | cut -d= -f2-)
APP_ID=$(grep '^AGENT_GH_APP_ID=' "$ENV_FILE" | cut -d= -f2-)
PEM_FILE="$SCRIPT_DIR/.github-app-key.pem"
if [ -n "$APP_ID" ] && [ -f "$PEM_FILE" ]; then
  echo "Minting fresh GitHub App installation token..."
  GH_TOKEN_VALUE=$("$SCRIPT_DIR/mint-github-app-token.sh" "$APP_ID" "$PEM_FILE")
fi

if [ -z "$GH_TOKEN_VALUE" ]; then
  echo "ERROR: no GitHub token available — this cannot push or open a PR." >&2
  echo "Add GitHub App credentials or a fine-grained PAT to Vault (see docs/infrastructure/secret-management.md), then run: pnpm agentic:dev-sandbox:up" >&2
  exit 1
fi

echo "Creating TODO entry for: $DESCRIPTION"
docker run --rm --init --name "vb-create-$(date +%s)" \
  --cap-add NET_ADMIN --cap-add NET_RAW \
  --env-file "$ENV_FILE" \
  -e GH_TOKEN="$GH_TOKEN_VALUE" \
  -e SOLVE_MODEL="$MODEL" \
  "$IMAGE" \
  bash -c 'exec bash "$HOME/vigilant-broccoli/infrastructure/agent-sandbox/create-todo-runner.sh" "$1"' _ "$DESCRIPTION"
