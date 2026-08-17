#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
IMAGE=vb-agent-sandbox
# Must match the emit_pr_details() prefixes in solve-todo-runner.sh — the
# container is --rm'd, so its tee'd stdout log is the only way its PR title
# and summary reach the host.
PR_TITLE_PREFIX='AGENT_PR_TITLE: '
PR_SUMMARY_B64_PREFIX='AGENT_PR_SUMMARY_B64: '
PR_DETAILS=""

collect_pr_details() {
  local log_file=$1 url title summary
  url=$(grep -Eo 'https://github.com/[^ ]+/pull/[0-9]+' "$log_file" | tail -1 || true)
  [ -n "$url" ] || return 0
  title=$(grep -m1 "^${PR_TITLE_PREFIX}" "$log_file" | sed "s/^${PR_TITLE_PREFIX}//")
  summary=$(grep -m1 "^${PR_SUMMARY_B64_PREFIX}" "$log_file" | sed "s/^${PR_SUMMARY_B64_PREFIX}//" | base64 -d 2>/dev/null || true)
  PR_DETAILS+="### ${title:-$url}
${url}

${summary}

"
}

write_pr_details_output() {
  [ -n "${GITHUB_OUTPUT:-}" ] || return 0
  {
    echo "pr_details<<PR_DETAILS_EOF"
    printf '%s' "$PR_DETAILS"
    echo "PR_DETAILS_EOF"
  } >>"$GITHUB_OUTPUT"
}

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
  echo "ERROR: no GitHub token available — solves cannot push or open PRs." >&2
  echo "Add GitHub App credentials or a fine-grained PAT to Vault (see docs/infrastructure/secret-management.md), then run: pnpm agentic:dev-sandbox:up" >&2
  exit 1
fi

# The token is minted at runtime, so GitHub Actions' log masker doesn't know it.
# Register it so it can't leak into job logs (e.g. the per-id logs tee'd by CI).
if [ -n "${GITHUB_ACTIONS:-}" ]; then
  echo "::add-mask::$GH_TOKEN"
fi

if [ -n "$PROMPT" ]; then
  LOG_DIR=$(mktemp -d /tmp/vb-solve.XXXXXX)
  LOG_FILE="$LOG_DIR/solve-prompt.log"
  echo "Solving free-text task (model: $MODEL): $PROMPT"
  echo "Log: $LOG_FILE"
  docker run --rm --init --name "vb-solve-prompt-$(date +%s)" \
    --cap-add NET_ADMIN --cap-add NET_RAW \
    -e CLAUDE_CODE_OAUTH_TOKEN \
    -e GH_TOKEN \
    -e AGENT_GH_APP_ID \
    -e SANDBOX_FIREWALL \
    -e SANDBOX_ALLOWED_DOMAINS \
    -e SOLVE_MODEL="$MODEL" \
    -e GITHUB_ACTIONS \
    "$IMAGE" \
    bash -c 'exec bash "$HOME/vigilant-broccoli/infrastructure/agent-sandbox/solve-todo-runner.sh" --prompt "$1"' _ "$PROMPT" \
    2>&1 | tee "$LOG_FILE"
  STATUS="${PIPESTATUS[0]}"
  collect_pr_details "$LOG_FILE"
  write_pr_details_output
  exit "$STATUS"
fi

LOG_DIR=$(mktemp -d /tmp/vb-solve.XXXXXX)
echo "Logs: $LOG_DIR"

PIDS=()
for id in "${IDS[@]}"; do
  grep -qE "^\|[[:space:]]*${id}[[:space:]]*\|" "$REPO_ROOT/TODO.md" || echo "WARNING: no '${id}' row in local TODO.md (sandbox clones fresh main)" >&2
  docker run --rm --init --name "vb-solve-${id}" \
    --cap-add NET_ADMIN --cap-add NET_RAW \
    -e CLAUDE_CODE_OAUTH_TOKEN \
    -e GH_TOKEN \
    -e AGENT_GH_APP_ID \
    -e SANDBOX_FIREWALL \
    -e SANDBOX_ALLOWED_DOMAINS \
    -e SOLVE_MODEL="$MODEL" \
    -e GITHUB_ACTIONS \
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
      collect_pr_details "$LOG_DIR/solve-${id}.log"
    else
      FAILED=1
      echo "✗ TODO ${id}: completed without opening a PR (see $LOG_DIR/solve-${id}.log)" >&2
    fi
  else
    FAILED=1
    echo "✗ TODO ${id} failed (see $LOG_DIR/solve-${id}.log)" >&2
  fi
done

write_pr_details_output
exit $FAILED
