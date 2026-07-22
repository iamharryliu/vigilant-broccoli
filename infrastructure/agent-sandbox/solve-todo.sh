#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
IMAGE=vb-agent-sandbox

MODEL=sonnet
PROMPT=""
IDS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --model)
      MODEL=$2
      shift 2
      ;;
    --prompt)
      PROMPT=$2
      shift 2
      ;;
    *)
      IDS+=("$1")
      shift
      ;;
  esac
done

if [ -n "$PROMPT" ] && [ ${#IDS[@]} -gt 0 ]; then
  echo "ERROR: pass either --prompt \"<task>\" or TODO ids, not both." >&2
  exit 1
fi
if [ -z "$PROMPT" ] && [ ${#IDS[@]} -eq 0 ]; then
  echo "Usage: pnpm agentic:task:solve [--model <model>] (<TODO_ID> [TODO_ID...] | --prompt \"<task description>\")" >&2
  exit 1
fi

if ! docker image inspect "$IMAGE" >/dev/null 2>&1; then
  docker compose -f "$SCRIPT_DIR/docker-compose.yml" build
fi

if [ -z "${CLAUDE_CODE_OAUTH_TOKEN:-}" ]; then
  . "$SCRIPT_DIR/load-env-from-vault.sh"
elif [ -n "${AGENT_GH_APP_ID:-}" ] && [ -n "${AGENT_GH_APP_PRIVATE_KEY:-}" ]; then
  echo "Minting fresh GitHub App installation token for this batch..." >&2
  GH_TOKEN=$("$SCRIPT_DIR/mint-github-app-token.sh" "$AGENT_GH_APP_ID" <(printf '%s\n' "$AGENT_GH_APP_PRIVATE_KEY"))
fi

if [ -z "${GH_TOKEN:-}" ]; then
  echo "ERROR: no GitHub token available — solves cannot push or open PRs." >&2
  echo "Add GitHub App credentials or a fine-grained PAT to Vault (see docs/infrastructure/secret-management.md), then run: pnpm agentic:dev-sandbox:up" >&2
  exit 1
fi

if [ -n "$PROMPT" ]; then
  echo "Solving free-text task (model: $MODEL): $PROMPT"
  docker run --rm --init --name "vb-solve-prompt-$(date +%s)" \
    --cap-add NET_ADMIN --cap-add NET_RAW \
    -e CLAUDE_CODE_OAUTH_TOKEN \
    -e GH_TOKEN \
    -e AGENT_GH_APP_ID \
    -e SANDBOX_FIREWALL \
    -e SANDBOX_ALLOWED_DOMAINS \
    -e SOLVE_MODEL="$MODEL" \
    "$IMAGE" \
    bash -c 'exec bash "$HOME/vigilant-broccoli/infrastructure/agent-sandbox/solve-todo-runner.sh" --prompt "$1"' _ "$PROMPT"
  exit $?
fi

LOG_DIR=$(mktemp -d /tmp/vb-solve.XXXXXX)
echo "Logs: $LOG_DIR"

PIDS=()
for id in "${IDS[@]}"; do
  grep -q "^### ${id}\." "$REPO_ROOT/TODO.md" || echo "WARNING: no '### ${id}.' item in local TODO.md (sandbox clones fresh main)" >&2
  docker run --rm --init --name "vb-solve-${id}" \
    --cap-add NET_ADMIN --cap-add NET_RAW \
    -e CLAUDE_CODE_OAUTH_TOKEN \
    -e GH_TOKEN \
    -e AGENT_GH_APP_ID \
    -e SANDBOX_FIREWALL \
    -e SANDBOX_ALLOWED_DOMAINS \
    -e SOLVE_MODEL="$MODEL" \
    "$IMAGE" \
    bash -c 'exec bash "$HOME/vigilant-broccoli/infrastructure/agent-sandbox/solve-todo-runner.sh" --id "$1"' _ "$id" \
    > "$LOG_DIR/solve-${id}.log" 2>&1 &
  PIDS+=($!)
  echo "Started vb-solve-${id} (model: $MODEL, log: $LOG_DIR/solve-${id}.log)"
done

FAILED=0
for i in "${!PIDS[@]}"; do
  id=${IDS[$i]}
  if wait "${PIDS[$i]}"; then
    PR_URL=$(grep -Eo 'https://github.com/[^ ]+/pull/[0-9]+' "$LOG_DIR/solve-${id}.log" | tail -1 || true)
    if [ -n "$PR_URL" ]; then
      echo "✓ TODO ${id}: $PR_URL"
    else
      FAILED=1
      echo "✗ TODO ${id}: completed without opening a PR (see $LOG_DIR/solve-${id}.log)" >&2
    fi
  else
    FAILED=1
    echo "✗ TODO ${id} failed (see $LOG_DIR/solve-${id}.log)" >&2
  fi
done

exit $FAILED
