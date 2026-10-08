#!/bin/bash
set -euo pipefail

# Appends the outcome of a sandbox run to the GitHub Actions job summary through
# the shared renderer, so the run page links straight to the PR it opened. Reads
# the runner's PR_URL:: marker, never a loose pull-URL match, since the log can
# carry diffs and notes that cite PRs. A *_CLEAN:: marker (AUDIT_CLEAN,
# PRUNE_CLEAN) means the run found nothing to change, which is not a failure.
LOG_FILE=${1:?Usage: write-pr-step-summary.sh <log_file> <exit_status> [label]}
STATUS=${2:?Usage: write-pr-step-summary.sh <log_file> <exit_status> [label]}
LABEL=${3:-}

[ -n "${GITHUB_STEP_SUMMARY:-}" ] || exit 0
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

PR_URL=$(grep -m1 '^PR_URL::' "$LOG_FILE" 2>/dev/null | sed 's/^PR_URL:://' || true)
if [ "$STATUS" != 0 ]; then
  OUTCOME=failed
elif [ -n "$PR_URL" ]; then
  OUTCOME=pr-created
elif grep -qE '^[A-Z]+_CLEAN:' "$LOG_FILE" 2>/dev/null; then
  OUTCOME=no-changes
else
  OUTCOME=no-pr
fi

AGENTIC_OUTCOME=$OUTCOME AGENTIC_PR_URL=$PR_URL AGENTIC_EXIT_CODE=$STATUS AGENTIC_LABEL=$LABEL \
  node "$SCRIPT_DIR/../../.github/scripts/agentic-run-summary.mjs" result
[ -z "${GITHUB_OUTPUT:-}" ] || echo "result_reported=true" >> "$GITHUB_OUTPUT"
