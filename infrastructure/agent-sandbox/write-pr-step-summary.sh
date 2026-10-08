#!/bin/bash
set -euo pipefail

# Appends the outcome of a sandbox run to the GitHub Actions job summary through
# the shared renderer, so the run page links straight to the PR it opened. Reads
# the runner's PR_URL:: marker, never a loose pull-URL match, since the log can
# carry diffs and notes that cite PRs. A *_CLEAN:: marker (AUDIT_CLEAN,
# PRUNE_CLEAN) means the run found nothing to change, which is not a failure.
# A failed solve run also prints a RESULT:: marker (salvaged, salvage-nothing,
# salvage-push-failed, salvage-pr-failed) saying what became of its partial work.
LOG_FILE=${1:?Usage: write-pr-step-summary.sh <log_file> <exit_status> [label]}
STATUS=${2:?Usage: write-pr-step-summary.sh <log_file> <exit_status> [label]}
LABEL=${3:-}

[ -n "${GITHUB_STEP_SUMMARY:-}" ] || exit 0
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

PR_URL=$(grep -m1 '^PR_URL::' "$LOG_FILE" 2>/dev/null | sed 's/^PR_URL:://' || true)
RESULT_MARKER=$(grep -m1 '^RESULT::' "$LOG_FILE" 2>/dev/null | sed 's/^RESULT:://' || true)
NOTE=
case "$RESULT_MARKER" in
  salvaged) NOTE="The agent run did not finish; its partial work was pushed and opened as a draft pull request." ;;
  salvage-nothing) NOTE="The agent run did not finish and left no changes to save." ;;
  salvage-push-failed) NOTE="The agent run did not finish and its partial work could not be pushed, so it was not saved." ;;
  salvage-pr-failed) NOTE="The agent run did not finish; its partial work was pushed to the run's branch but no pull request could be opened." ;;
esac

if [ "$STATUS" != 0 ]; then
  OUTCOME=failed
elif [ -n "$PR_URL" ]; then
  OUTCOME=pr-created
elif grep -qE '^[A-Z]+_CLEAN:' "$LOG_FILE" 2>/dev/null; then
  OUTCOME=no-changes
else
  OUTCOME=no-pr
fi

AGENTIC_OUTCOME=$OUTCOME AGENTIC_PR_URL=$PR_URL AGENTIC_EXIT_CODE=$STATUS AGENTIC_LABEL=$LABEL AGENTIC_NOTE=$NOTE \
  node "$SCRIPT_DIR/../../.github/scripts/agentic-run-summary.mjs" result
[ -z "${GITHUB_OUTPUT:-}" ] || echo "result_reported=true" >> "$GITHUB_OUTPUT"
