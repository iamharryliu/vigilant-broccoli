#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
IMAGE=vb-agent-sandbox

MODEL=sonnet
IDS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --model)
      MODEL=$2
      shift 2
      ;;
    *)
      IDS+=("$1")
      shift
      ;;
  esac
done

if [ ${#IDS[@]} -eq 0 ]; then
  echo "Usage: pnpm sandbox:solve [--model <model>] <TODO_ID> [TODO_ID...]" >&2
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
  echo "Minting fresh GitHub App installation token for this batch..."
  GH_TOKEN_VALUE=$("$SCRIPT_DIR/mint-github-app-token.sh" "$APP_ID" "$PEM_FILE")
fi

if [ -z "$GH_TOKEN_VALUE" ]; then
  echo "ERROR: no GitHub token available — solves cannot push or open PRs." >&2
  echo "Add GitHub App credentials or a fine-grained PAT to Vault (see docs/infrastructure/secret-management.md), then run: pnpm sandbox:up" >&2
  exit 1
fi

LOG_DIR=$(mktemp -d /tmp/vb-solve.XXXXXX)
echo "Logs: $LOG_DIR"

solve_prompt() {
  cat <<EOF
You are running non-interactively in a fresh clone of vigilant-broccoli. Solve TODO item $1:

1. Read TODO.md at the repo root and find the item under the heading starting with "### $1.". If no such item exists, print an error and exit non-zero without making changes.
2. Resolve the issue described by that item.
3. Remove the resolved item from TODO.md (and its priority heading, e.g. "## P2", if it has no items left).
4. Invoke the /git-workflow command (instructions in ~/.claude/commands/git-workflow.md) to branch, commit, push, and open a PR that includes both the fix and the TODO.md update.
5. Print the PR URL.
EOF
}

PIDS=()
for id in "${IDS[@]}"; do
  grep -q "^### ${id}\." "$REPO_ROOT/TODO.md" || echo "WARNING: no '### ${id}.' item in local TODO.md (sandbox clones fresh main)" >&2
  docker run --rm --init --name "vb-solve-${id}" \
    --cap-add NET_ADMIN --cap-add NET_RAW \
    --env-file "$ENV_FILE" \
    -e GH_TOKEN="$GH_TOKEN_VALUE" \
    -e SOLVE_PROMPT="$(solve_prompt "$id")" \
    -e SOLVE_MODEL="$MODEL" \
    "$IMAGE" \
    bash -c 'cd "$HOME/vigilant-broccoli" && exec claude -p "$SOLVE_PROMPT" --dangerously-skip-permissions --model "$SOLVE_MODEL"' \
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
