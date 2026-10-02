#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
IMAGE=vb-agent-sandbox

AGENT_RUNNER=claude
MODEL=sonnet
CODEX_MODEL=""
PROMPT=""
IDS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --agent)
      AGENT_RUNNER=$2
      shift 2
      ;;
    --model)
      MODEL=$2
      shift 2
      ;;
    --codex-model)
      CODEX_MODEL=$2
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

case "$AGENT_RUNNER" in
  claude | codex) ;;
  *)
    echo "ERROR: --agent must be 'claude' or 'codex'." >&2
    exit 1
    ;;
esac
if [ -n "$PROMPT" ] && [ ${#IDS[@]} -gt 0 ]; then
  echo "ERROR: pass either --prompt \"<task>\" or TODO ids, not both." >&2
  exit 1
fi
if [ -z "$PROMPT" ] && [ ${#IDS[@]} -eq 0 ]; then
  echo "Usage: pnpm agentic:task:solve [--agent claude|codex] [--model <claude-model>] [--codex-model <codex-model>] (<TODO_ID> [TODO_ID...] | --prompt \"<task description>\")" >&2
  exit 1
fi

# Pulls the PR_TITLE::/PR_URL::/PR_SUMMARY_*/PR_DIFF_* markers a runner log
# printed after `gh pr create` and appends one JSON record per solve to $2,
# which the CI email step renders into a styled diff. JSON Lines keeps the diff
# intact — it carries newlines, markdown and HTML metacharacters that no flat
# text format survives.
write_pr_details() {
  local log_file=$1 out_file=$2 label=${3:-}
  local title url summary diff
  title=$(grep -m1 '^PR_TITLE::' "$log_file" 2>/dev/null | sed 's/^PR_TITLE:://' || true)
  [ -n "$title" ] || return 0
  url=$(grep -m1 '^PR_URL::' "$log_file" 2>/dev/null | sed 's/^PR_URL:://' || true)
  summary=$(awk '/^PR_SUMMARY_BEGIN$/{f=1;next} /^PR_SUMMARY_END$/{f=0} f' "$log_file")
  diff=$(awk '/^PR_DIFF_BEGIN$/{f=1;next} /^PR_DIFF_END$/{f=0} f' "$log_file")
  jq -nc \
    --arg label "$label" \
    --arg title "$title" \
    --arg url "$url" \
    --arg summary "$summary" \
    --arg diff "$diff" \
    '{label: $label, title: $title, url: $url, summary: $summary, diff: $diff}' >> "$out_file"
}

if ! docker image inspect "$IMAGE" >/dev/null 2>&1; then
  docker compose -f "$SCRIPT_DIR/docker-compose.yml" build
fi

NEEDS_VAULT=0
if [ "$AGENT_RUNNER" = claude ] && [ -z "${CLAUDE_CODE_OAUTH_TOKEN:-}" ]; then
  NEEDS_VAULT=1
fi
if [ "$AGENT_RUNNER" = codex ] && [ -z "${AGENT_CODEX_ACCESS_TOKEN:-}" ]; then
  NEEDS_VAULT=1
fi
if [ -z "${GH_TOKEN:-}" ] && { [ -z "${AGENT_GH_APP_ID:-}" ] || [ -z "${AGENT_GH_APP_PRIVATE_KEY:-}" ]; }; then
  NEEDS_VAULT=1
fi

if [ "$NEEDS_VAULT" = "1" ]; then
  if [ -n "${GITHUB_ACTIONS:-}" ]; then
    echo "ERROR: required sandbox secrets were not imported from Vault for agent '$AGENT_RUNNER'." >&2
    exit 1
  fi
  AGENT_RUNNER="$AGENT_RUNNER" . "$SCRIPT_DIR/load-env-from-vault.sh"
elif [ -n "${AGENT_GH_APP_ID:-}" ] && [ -n "${AGENT_GH_APP_PRIVATE_KEY:-}" ]; then
  echo "Minting fresh GitHub App installation token for this batch..." >&2
  GH_TOKEN=$("$SCRIPT_DIR/mint-github-app-token.sh" "$AGENT_GH_APP_ID" <(printf '%s\n' "$AGENT_GH_APP_PRIVATE_KEY"))
  # export so `docker run -e GH_TOKEN` forwards it into the container (the
  # load-env-from-vault.sh path above exports it too); without this the sandbox
  # gets no token and `git push` fails with "could not read Username".
  export GH_TOKEN
fi

if [ "$AGENT_RUNNER" = claude ] && [ -z "${CLAUDE_CODE_OAUTH_TOKEN:-}" ]; then
  echo "ERROR: no Claude Code OAuth token available for --agent claude." >&2
  exit 1
fi
if [ "$AGENT_RUNNER" = codex ] && [ -z "${AGENT_CODEX_ACCESS_TOKEN:-}" ]; then
  echo "ERROR: no AGENT_CODEX_ACCESS_TOKEN available for --agent codex." >&2
  echo "Add AGENT_CODEX_ACCESS_TOKEN to Vault (${VAULT_KV_PATH:-kv/data/secrets}) or export it locally before running." >&2
  exit 1
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
  [ -z "${AGENT_CODEX_ACCESS_TOKEN:-}" ] || echo "::add-mask::$AGENT_CODEX_ACCESS_TOKEN"
fi

RUNNER_MODEL=$MODEL
if [ "$AGENT_RUNNER" = codex ]; then
  RUNNER_MODEL=${CODEX_MODEL:-default}
fi
RUNNER_PATH=/usr/local/bin/solve-todo-runner.sh
DOCKER_ENV_ARGS=(
  -e GH_TOKEN
  -e AGENT_GH_APP_ID
  -e SANDBOX_FIREWALL
  -e SANDBOX_ALLOWED_DOMAINS
  -e SOLVE_AGENT="$AGENT_RUNNER"
  -e SOLVE_MODEL="$MODEL"
  -e CODEX_MODEL="$CODEX_MODEL"
  -e GITHUB_ACTIONS
)
if [ "$AGENT_RUNNER" = claude ]; then
  DOCKER_ENV_ARGS+=(-e CLAUDE_CODE_OAUTH_TOKEN)
else
  DOCKER_ENV_ARGS+=(-e AGENT_CODEX_ACCESS_TOKEN)
fi

if [ -n "$PROMPT" ]; then
  LOG_DIR=$(mktemp -d /tmp/vb-solve.XXXXXX)
  LOG_FILE="$LOG_DIR/solve-prompt.log"
  echo "Solving free-text task (agent: $AGENT_RUNNER, model: $RUNNER_MODEL): $PROMPT"
  echo "Log: $LOG_FILE"
  docker run --rm --init --name "vb-solve-prompt-$(date +%s)" \
    --cap-add NET_ADMIN --cap-add NET_RAW \
    "${DOCKER_ENV_ARGS[@]}" \
    "$IMAGE" \
    bash -c 'exec bash "$0" --prompt "$1"' "$RUNNER_PATH" "$PROMPT" \
    2>&1 | tee "$LOG_FILE"
  STATUS="${PIPESTATUS[0]}"
  write_pr_details "$LOG_FILE" "$LOG_DIR/pr-details.jsonl"
  if [ -n "${GITHUB_OUTPUT:-}" ] && [ -f "$LOG_DIR/pr-details.jsonl" ]; then
    echo "pr_details_file=$LOG_DIR/pr-details.jsonl" >> "$GITHUB_OUTPUT"
  fi
  exit "$STATUS"
fi

LOG_DIR=$(mktemp -d /tmp/vb-solve.XXXXXX)
echo "Logs: $LOG_DIR"

PIDS=()
for id in "${IDS[@]}"; do
  grep -qE "^\|[[:space:]]*${id}[[:space:]]*\|" "$REPO_ROOT/TODO.md" || echo "WARNING: no '${id}' row in local TODO.md (sandbox clones fresh main)" >&2
  docker run --rm --init --name "vb-solve-${id}" \
    --cap-add NET_ADMIN --cap-add NET_RAW \
    "${DOCKER_ENV_ARGS[@]}" \
    "$IMAGE" \
    bash -c 'exec bash "$0" --id "$1"' "$RUNNER_PATH" "$id" \
    > "$LOG_DIR/solve-${id}.log" 2>&1 &
  PIDS+=($!)
  echo "Started vb-solve-${id} (agent: $AGENT_RUNNER, model: $RUNNER_MODEL, log: $LOG_DIR/solve-${id}.log)"
done

FAILED=0
for i in "${!PIDS[@]}"; do
  id=${IDS[$i]}
  if wait "${PIDS[$i]}"; then
    # Anchored to the marker, not a loose URL match: the log now carries the
    # branch diff too, and a solve that adds a PR link to a note would otherwise
    # look like the PR this run opened.
    PR_URL=$(grep -m1 '^PR_URL::' "$LOG_DIR/solve-${id}.log" 2>/dev/null | sed 's/^PR_URL:://' || true)
    if [ -n "$PR_URL" ]; then
      echo "✓ TODO ${id}: $PR_URL"
      write_pr_details "$LOG_DIR/solve-${id}.log" "$LOG_DIR/pr-details.jsonl" "$id"
    else
      FAILED=1
      echo "✗ TODO ${id}: completed without opening a PR (see $LOG_DIR/solve-${id}.log)" >&2
    fi
  else
    FAILED=1
    echo "✗ TODO ${id} failed (see $LOG_DIR/solve-${id}.log)" >&2
    write_pr_details "$LOG_DIR/solve-${id}.log" "$LOG_DIR/pr-details.jsonl" "$id (salvage)"
  fi
done

if [ -n "${GITHUB_OUTPUT:-}" ] && [ -f "$LOG_DIR/pr-details.jsonl" ]; then
  echo "pr_details_file=$LOG_DIR/pr-details.jsonl" >> "$GITHUB_OUTPUT"
fi

exit $FAILED
