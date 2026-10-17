#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
IMAGE=vb-agent-sandbox

MODEL=sonnet
while [ $# -gt 0 ]; do
  case "$1" in
    --model)
      if [ $# -lt 2 ]; then
        echo "Usage: pnpm agentic-pr-create-todo-audit [--model <model>]" >&2
        exit 1
      fi
      MODEL=$2
      shift 2
      ;;
    *)
      echo "Usage: pnpm agentic-pr-create-todo-audit [--model <model>]" >&2
      exit 1
      ;;
  esac
done

if ! docker image inspect "$IMAGE" >/dev/null 2>&1; then
  docker compose -f "$SCRIPT_DIR/docker-compose.yml" build
fi

if [ -z "${CLAUDE_CODE_OAUTH_TOKEN:-}" ]; then
  . "$SCRIPT_DIR/load-env-from-vault.sh"
elif [ -n "${AGENT_GH_APP_ID:-}" ] && [ -n "${AGENT_GH_APP_PRIVATE_KEY:-}" ]; then
  echo "Minting fresh GitHub App installation token..." >&2
  GH_TOKEN=$("$SCRIPT_DIR/mint-github-app-token.sh" "$AGENT_GH_APP_ID" <(printf '%s\n' "$AGENT_GH_APP_PRIVATE_KEY"))
  # export so `docker run -e GH_TOKEN` forwards it into the container (the
  # load-env-from-vault.sh path above exports it too); without this the sandbox
  # gets no token and `git push` fails with "could not read Username".
  export GH_TOKEN
fi

if [ -z "${GH_TOKEN:-}" ]; then
  echo "ERROR: no GitHub token available — this cannot push or open a PR." >&2
  echo "Add GitHub App credentials or a fine-grained PAT to Vault (see docs/infrastructure/secret-management.md), then run: pnpm agentic:dev-sandbox:up" >&2
  exit 1
fi

echo "Auditing every TODO.md row for stale and resolved entries"
STATUS=0
LOG_FILE=$(mktemp /tmp/vb-todo-audit.XXXXXX)
docker run --rm --init --name "vb-todo-audit-$(date +%s)" \
  --cap-add NET_ADMIN --cap-add NET_RAW \
  -e CLAUDE_CODE_OAUTH_TOKEN \
  -e GH_TOKEN \
  -e AGENT_GH_APP_ID \
  -e SANDBOX_FIREWALL \
  -e SANDBOX_ALLOWED_DOMAINS \
  -e SOLVE_MODEL="$MODEL" \
  "$IMAGE" \
  bash -c 'exec bash "$HOME/vigilant-broccoli/infrastructure/agent-sandbox/audit-todo-runner.sh"' \
  2>&1 | tee "$LOG_FILE" || STATUS="${PIPESTATUS[0]}"
bash "$SCRIPT_DIR/write-pr-step-summary.sh" "$LOG_FILE" "$STATUS"
exit "$STATUS"
