#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
IMAGE=vb-agent-sandbox

MODEL=sonnet
ARGS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --model)
      MODEL=$2
      shift 2
      ;;
    --prompt)
      ARGS+=("$2")
      shift 2
      ;;
    *)
      ARGS+=("$1")
      shift
      ;;
  esac
done

PR="${ARGS[0]:-}"
INSTRUCTION="${ARGS[*]:1}"
if [ -z "$PR" ] || [ -z "$INSTRUCTION" ]; then
  echo "Usage: pnpm agentic:pr:update [--model <model>] <PR_NUMBER_OR_URL> <instruction>" >&2
  echo "  e.g. pnpm agentic:pr:update 149 \"add input validation to the new route\"" >&2
  exit 1
fi

if ! docker image inspect "$IMAGE" >/dev/null 2>&1; then
  docker compose -f "$SCRIPT_DIR/docker-compose.yml" build
fi

if [ -z "${CLAUDE_CODE_OAUTH_TOKEN:-}" ]; then
  . "$SCRIPT_DIR/load-env-from-vault.sh"
elif [ -n "${AGENT_GH_APP_ID:-}" ] && [ -n "${AGENT_GH_APP_PRIVATE_KEY:-}" ]; then
  echo "Minting fresh GitHub App installation token..." >&2
  # Accept the key either as raw PEM or base64-encoded (mirrors load-env-from-vault.sh)
  # so the CI path works regardless of how AGENT_GH_APP_PRIVATE_KEY is stored in Vault.
  case "$AGENT_GH_APP_PRIVATE_KEY" in
    -----BEGIN*) PEM_CONTENT="$AGENT_GH_APP_PRIVATE_KEY" ;;
    *) PEM_CONTENT=$(printf '%s' "$AGENT_GH_APP_PRIVATE_KEY" | base64 -d) ;;
  esac
  GH_TOKEN=$("$SCRIPT_DIR/mint-github-app-token.sh" "$AGENT_GH_APP_ID" <(printf '%s\n' "$PEM_CONTENT"))
  # export so `docker run -e GH_TOKEN` forwards it into the container (the
  # load-env-from-vault.sh path above exports it too); without this the sandbox
  # gets no token and `git push` fails with "could not read Username".
  export GH_TOKEN
fi

if [ -z "${GH_TOKEN:-}" ]; then
  echo "ERROR: no GitHub token available — this cannot check out, push, or comment on the PR." >&2
  echo "Add GitHub App credentials or a fine-grained PAT to Vault (see docs/infrastructure/secret-management.md), then run: pnpm agentic:dev-sandbox:up" >&2
  exit 1
fi

# The token is minted at runtime, so GitHub Actions' log masker doesn't know it.
# Register it so it can't leak into job logs.
if [ -n "${GITHUB_ACTIONS:-}" ]; then
  echo "::add-mask::$GH_TOKEN"
fi

echo "Updating PR (model: $MODEL): #$PR — $INSTRUCTION"
docker run --rm --init --name "vb-update-pr-$(date +%s)" \
  --cap-add NET_ADMIN --cap-add NET_RAW \
  -e CLAUDE_CODE_OAUTH_TOKEN \
  -e GH_TOKEN \
  -e AGENT_GH_APP_ID \
  -e SANDBOX_FIREWALL \
  -e SANDBOX_ALLOWED_DOMAINS \
  -e SOLVE_MODEL="$MODEL" \
  "$IMAGE" \
  bash -c 'exec bash "$HOME/vigilant-broccoli/infrastructure/agent-sandbox/update-pr-runner.sh" "$1" "$2"' _ "$PR" "$INSTRUCTION"
