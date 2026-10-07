#!/bin/bash
set -euo pipefail

# Appends the PR a sandbox run opened to the GitHub Actions job summary, so the
# run page links straight to it. Reads the runner's PR_URL:: marker, never a
# loose pull-URL match, since the log can carry diffs and notes that cite PRs.
LOG_FILE=${1:?Usage: write-pr-step-summary.sh <log_file> [label]}
LABEL=${2:-}

[ -n "${GITHUB_STEP_SUMMARY:-}" ] || exit 0
PR_URL=$(grep -m1 '^PR_URL::' "$LOG_FILE" 2>/dev/null | sed 's/^PR_URL:://' || true)
[ -n "$PR_URL" ] || exit 0
echo "**Pull request${LABEL:+ ($LABEL)}:** $PR_URL" >> "$GITHUB_STEP_SUMMARY"
