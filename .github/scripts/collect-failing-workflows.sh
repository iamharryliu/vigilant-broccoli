#!/usr/bin/env bash
# Prints the input for select-failing-workflows.jq: every repo workflow with its
# recent completed default-branch runs, the fix dispatches already made (runs of
# the dispatch workflow whose title carries the marker) and open PR bodies that
# carry it. Needs a GH_TOKEN with actions:read and pull-requests:read.
#
#   bash .github/scripts/collect-failing-workflows.sh <owner/repo> [branch]
set -euo pipefail

REPO=${1:?usage: collect-failing-workflows.sh <owner/repo> [branch]}
BRANCH=${2:-main}
MARKER=${FIX_FAILING_MARKER:-fix-failing-actions}
DISPATCH_WORKFLOW=manual-agentic-pr-create.yml
# Deep enough to find the last success behind a run of daily failures.
RUNS_PER_WORKFLOW=30

# Files, not --argjson: the run lists exceed the per-argument size limit.
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

gh api --paginate "repos/$REPO/actions/workflows?per_page=100" \
  --jq '.workflows[] | select((.path | startswith(".github/workflows/")) and .state == "active") | {id, name, path, state}' \
  | while read -r wf; do
    gh api "repos/$REPO/actions/workflows/$(jq -r .id <<<"$wf")/runs?branch=$BRANCH&status=completed&exclude_pull_requests=true&per_page=$RUNS_PER_WORKFLOW" \
      --jq '[.workflow_runs[] | {id, event, conclusion, head_sha, html_url, created_at}]' \
      | jq -c --argjson wf "$wf" '$wf + {runs: .}'
  done > "$WORK/workflows.jsonl"

gh api --paginate "repos/$REPO/actions/workflows/$DISPATCH_WORKFLOW/runs?per_page=100" \
  --jq ".workflow_runs[] | select(.display_title | contains(\"[$MARKER:\")) | {display_title, created_at}" \
  > "$WORK/dispatches.jsonl"

gh pr list --repo "$REPO" --state open --limit 200 --json number,body \
  --jq ".[] | select(.body | contains(\"[$MARKER:\")) | {number, body}" > "$WORK/open-prs.jsonl"

jq -n --slurpfile workflows "$WORK/workflows.jsonl" --slurpfile dispatches "$WORK/dispatches.jsonl" \
  --slurpfile open_prs "$WORK/open-prs.jsonl" \
  '{workflows: $workflows, dispatches: $dispatches, open_prs: $open_prs}'
