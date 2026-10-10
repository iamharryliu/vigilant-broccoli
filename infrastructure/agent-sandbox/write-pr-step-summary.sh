#!/bin/bash
set -euo pipefail

# Appends the outcome of a sandbox run to the GitHub Actions job summary through
# the shared renderer, so the run page links straight to every PR it opened. A
# run can open several (one PR_URL:: record per increment, with PR_TITLE::,
# PR_STATE:: and PR_BASE::), and lists each increment it could not publish from
# INCREMENT_UNPUBLISHED:: lines. Reads the runner's markers, never a loose
# pull-URL match, since the log can carry diffs and notes that cite PRs. A *_CLEAN:: marker (AUDIT_CLEAN,
# PRUNE_CLEAN) means the run found nothing to change, which is not a failure.
# A failed solve run also prints a RESULT:: marker (salvaged, salvage-nothing,
# salvage-push-failed, salvage-pr-failed) saying what became of its partial work.
LOG_FILE=${1:?Usage: write-pr-step-summary.sh <log_file> <exit_status> [label]}
STATUS=${2:?Usage: write-pr-step-summary.sh <log_file> <exit_status> [label]}
LABEL=${3:-}

[ -n "${GITHUB_STEP_SUMMARY:-}" ] || exit 0
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

PULL_REQUESTS=$(awk '
  function flush() { if (url != "") print url "\t" title "\t" state "\t" base; url = title = state = base = "" }
  /^PR_TITLE::/ { flush(); title = substr($0, 11) }
  /^PR_URL::/ { if (url != "") flush(); url = substr($0, 9) }
  /^PR_STATE::/ { state = substr($0, 11) }
  /^PR_BASE::/ { base = substr($0, 10) }
  END { flush() }
' "$LOG_FILE" 2>/dev/null | jq -Rsc 'split("\n") | map(select(length > 0) | split("\t") | {url: .[0], title: .[1], state: .[2], base: .[3]})')
UNPUBLISHED=$({ grep '^INCREMENT_UNPUBLISHED::' "$LOG_FILE" 2>/dev/null || true; } | sed 's/^INCREMENT_UNPUBLISHED:://' | jq -sc .)
PR_URL=$(jq -r '.[0].url // empty' <<<"$PULL_REQUESTS")
RESULT_MARKER=$(grep -m1 '^RESULT::' "$LOG_FILE" 2>/dev/null | sed 's/^RESULT:://' || true)
NOTE=
case "$RESULT_MARKER" in
  salvaged) NOTE="The agent run did not finish; its partial work was pushed and opened as a draft pull request." ;;
  salvage-nothing) NOTE="The agent run did not finish and left no changes to save." ;;
  salvage-push-failed) NOTE="The agent run did not finish and its partial work could not be pushed, so it was not saved." ;;
  salvage-pr-failed) NOTE="The agent run did not finish; its partial work was pushed to the run's branch but no pull request could be opened." ;;
esac
if grep -q '^STACK_UPDATE_FAILED::' "$LOG_FILE" 2>/dev/null; then
  NOTE="${NOTE:+$NOTE }The stack section could not be added to every pull request."
fi

if [ "$STATUS" != 0 ]; then
  OUTCOME=failed
elif [ -n "$PR_URL" ] && [ "$(jq 'length' <<<"$UNPUBLISHED")" -gt 0 ]; then
  OUTCOME=failed
elif [ -n "$PR_URL" ]; then
  OUTCOME=pr-created
elif grep -qE '^[A-Z]+_CLEAN:' "$LOG_FILE" 2>/dev/null; then
  OUTCOME=no-changes
else
  OUTCOME=no-pr
fi

AGENTIC_OUTCOME=$OUTCOME AGENTIC_PULL_REQUESTS=$PULL_REQUESTS AGENTIC_UNPUBLISHED=$UNPUBLISHED AGENTIC_EXIT_CODE=$STATUS AGENTIC_LABEL=$LABEL AGENTIC_NOTE=$NOTE \
  node "$SCRIPT_DIR/../../.github/scripts/agentic-run-summary.mjs" result
[ -z "${GITHUB_OUTPUT:-}" ] || echo "result_reported=true" >> "$GITHUB_OUTPUT"
