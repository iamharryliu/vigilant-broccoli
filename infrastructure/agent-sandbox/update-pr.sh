#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
IMAGE=vb-agent-sandbox

MODEL=sonnet
ARGS=()
usage() {
  echo "Usage: pnpm agentic-pr-update [--model <model>] [--with-ci-logs] <PR_NUMBER_OR_URL> <instruction>" >&2
  echo "  e.g. pnpm agentic-pr-update 149 \"add input validation to the new route\"" >&2
  echo "       pnpm agentic-pr-update --with-ci-logs 149 \"fix the failing checks\"" >&2
  exit 1
}
while [ $# -gt 0 ]; do
  case "$1" in
    --model)
      [ $# -ge 2 ] && [ -n "$2" ] || usage
      MODEL=$2
      shift 2
      ;;
    --prompt)
      [ $# -ge 2 ] || usage
      ARGS+=("$2")
      shift 2
      ;;
    --with-ci-logs)
      export SANDBOX_CI_LOGS=1
      shift
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
  usage
fi

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
  echo "ERROR: no GitHub token available — this cannot check out, push, or update the PR body." >&2
  echo "Add GitHub App credentials or a fine-grained PAT to Vault (see docs/infrastructure/secret-management.md), then run: pnpm agentic:dev-sandbox:up" >&2
  exit 1
fi

# The token is minted at runtime, so GitHub Actions' log masker doesn't know it.
# Register it so it can't leak into job logs.
if [ -n "${GITHUB_ACTIONS:-}" ]; then
  echo "::add-mask::$GH_TOKEN"
fi

LOG_DIR=$(mktemp -d /tmp/vb-update.XXXXXX)
LOG_FILE="$LOG_DIR/update-pr.log"
STATUS=0
echo "Updating PR (model: $MODEL): #$PR — $INSTRUCTION"
docker run --rm --init --name "vb-update-pr-$(date +%s)" \
  --cap-add NET_ADMIN --cap-add NET_RAW \
  -e CLAUDE_CODE_OAUTH_TOKEN \
  -e GH_TOKEN \
  -e AGENT_GH_APP_ID \
  -e SANDBOX_FIREWALL \
  -e SANDBOX_MERGE_MAIN \
  -e SANDBOX_CI_LOGS \
  -e SANDBOX_FIX_CI \
  -e SANDBOX_ALLOWED_DOMAINS \
  -e SOLVE_MODEL="$MODEL" \
  "$IMAGE" \
  bash -c 'exec bash "$HOME/vigilant-broccoli/infrastructure/agent-sandbox/update-pr-runner.sh" "$1" "$2"' _ "$PR" "$INSTRUCTION" \
  2>&1 | tee "$LOG_FILE" || STATUS="${PIPESTATUS[0]}"

# The target PR is reported by the caller. Follow-up increments the update
# published as separate PRs (or could not publish) get their own summary section.
if grep -qE '^(PR_URL|INCREMENT_UNPUBLISHED)::' "$LOG_FILE"; then
  bash "$SCRIPT_DIR/write-pr-step-summary.sh" "$LOG_FILE" "$STATUS" "Follow-up increments"
fi
exit "$STATUS"
