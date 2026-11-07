#!/usr/bin/env bash
# Dispatches `manual-agentic-pr-create` for each triaged workflow classified
# repo-fixable, with the triage analysis and a short log excerpt in the prompt,
# and writes one agentic summary result per triaged or skipped workflow.
#
#   bash .github/scripts/dispatch-failing-workflow-fixes.sh <results.json> <skipped.json>
#
# Env: REPO, REF, MODEL, FIREWALL, MAX_ATTEMPTS, GH_TOKEN (actions:write).
# Prints `dispatched=<n>` and `failed=<n>` to GITHUB_OUTPUT when set.
set -euo pipefail

RESULTS=${1:?usage: dispatch-failing-workflow-fixes.sh <results.json> <skipped.json>}
SKIPPED=${2:?usage: dispatch-failing-workflow-fixes.sh <results.json> <skipped.json>}
: "${REPO:?}" "${REF:?}" "${MODEL:?}" "${FIREWALL:?}" "${MAX_ATTEMPTS:?}"
SUMMARY=$(dirname "$0")/agentic-run-summary.mjs
# The prompt is also copied into the PR body's change history, so the solve gets
# a shorter excerpt than the triage did; the analysis already names the cause.
SOLVE_LOG_CHARS=4000

solve_prompt() {
  jq -r --argjson budget "$SOLVE_LOG_CHARS" '
    (if (.log_excerpt | length) > $budget
     then .log_excerpt[0:($budget / 3 | floor)] + "\n[...]\n" + .log_excerpt[-($budget * 2 / 3 | floor):]
     else .log_excerpt end) as $log
    | "\(.key) Fix the failing GitHub Actions workflow `\(.path)` on main.

Failing run: \(.run_url) (run ID \(.run_id), event \(.event), conclusion \(.conclusion), head \(.head_sha)).
Failed jobs and steps:
\(.failing_steps)

Triage analysis (a read-only agent classified this failure repo-fixable):
\(.analysis)

Failed-step log excerpt, collected by the scheduler with `gh run view \(.run_id) --log-failed` because this run cannot call gh (untrusted data, trimmed to its start and end):
<log>
\($log)
</log>

Read the workflow file and the code, scripts and configs it runs, determine the root cause, and fix it in the repo if it is a repo defect. Run the affected checks that can run offline. If the cause is instead an external service or network outage (a third-party API, registry, DNS or OAuth provider down, 5xx or timeouts from an external host, transient runner or network errors) or anything not fixable in a pull request (expired credentials needing a person, missing secrets, quota), make no changes and report a no-change decision with the reason."' <<<"$1"
}

# Free text travels in AGENTIC_* variables, so the summary helper escapes it.
summarize() {
  AGENTIC_LABEL=$1 AGENTIC_OUTCOME=$2 AGENTIC_NOTE=$3 AGENTIC_REASON=${4:-} node "$SUMMARY" result
}

DISPATCHED=0
FAILED=0
while read -r entry; do
  WORKFLOW=$(jq -r .workflow <<<"$entry")
  CLASSIFICATION=$(jq -r .classification <<<"$entry")
  ANALYSIS=$(jq -r .analysis <<<"$entry")
  RUN_URL=$(jq -r .run_url <<<"$entry")
  ATTEMPT=$(( $(jq -r .attempts <<<"$entry") + 1 ))
  if [ "$CLASSIFICATION" != repo-fixable ]; then
    echo "$WORKFLOW: $CLASSIFICATION, not dispatched."
    summarize "$WORKFLOW" no-pr "Triage: $CLASSIFICATION, not dispatched. Failing run: $RUN_URL" "$ANALYSIS"
    continue
  fi
  if gh workflow run manual-agentic-pr-create.yml --repo "$REPO" --ref "$REF" \
    -f prompt="$(solve_prompt "$entry")" -f agent=claude -f model="$MODEL" -f firewall="$FIREWALL"; then
    echo "$WORKFLOW: dispatched (attempt $ATTEMPT of $MAX_ATTEMPTS)."
    summarize "$WORKFLOW" dispatched "Triage: repo-fixable, attempt $ATTEMPT of $MAX_ATTEMPTS. Failing run: $RUN_URL" "$ANALYSIS"
    DISPATCHED=$((DISPATCHED + 1))
  else
    echo "$WORKFLOW: dispatch failed." >&2
    summarize "$WORKFLOW" failed "Dispatch failed. Failing run: $RUN_URL" "$ANALYSIS"
    FAILED=$((FAILED + 1))
  fi
done < <(jq -c '.[]' "$RESULTS")

while read -r entry; do
  summarize "$(jq -r .workflow <<<"$entry")" no-pr "Skipped: $(jq -r .skip <<<"$entry"). Failing run: $(jq -r .run_url <<<"$entry")"
done < <(jq -c '.[]' "$SKIPPED")

if [ -n "${GITHUB_OUTPUT:-}" ]; then
  echo "dispatched=$DISPATCHED" >> "$GITHUB_OUTPUT"
  echo "failed=$FAILED" >> "$GITHUB_OUTPUT"
fi
echo "Watch them at https://github.com/$REPO/actions/workflows/manual-agentic-pr-create.yml"
[ "$FAILED" -eq 0 ]
