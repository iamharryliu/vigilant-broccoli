#!/bin/bash
set -euo pipefail

PR=${1:?Usage: fix-pr-runner.sh <PR_NUMBER_OR_URL>}
MODEL=${SOLVE_MODEL:-sonnet}
REPO_DIR="$HOME/vigilant-broccoli"
META_FILE=/tmp/fix-meta.json
CI_LOG=/tmp/pr-ci-failures.log
CI_LOG_BUDGET=20000
FALLBACK_TRAILER='Co-authored-by: Claude <noreply@anthropic.com>'
PRE_COMMIT_HELPER=/tmp/run-pre-commit.sh
MERGE_BODY_HELPER=/tmp/merge-pr-body.py

cd "$REPO_DIR"

# Stash the helpers outside the working tree before checkout — the PR branch may predate them,
# and gh pr checkout would otherwise leave us on a branch where the helper paths don't exist.
cp "$REPO_DIR/infrastructure/agent-sandbox/run-pre-commit.sh" "$PRE_COMMIT_HELPER"
cp "$REPO_DIR/infrastructure/agent-sandbox/merge-pr-body.py" "$MERGE_BODY_HELPER"

git fetch origin --quiet
gh pr checkout "$PR"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
BASE_SHA=$(git rev-parse HEAD)
rm -f "$META_FILE"
CURRENT_BODY=$(gh pr view "$PR" --json body -q .body 2>/dev/null || true)

: > "$CI_LOG"
gh pr checks "$PR" >> "$CI_LOG" 2>&1 || true
for run_id in $(gh run list --branch "$BRANCH" --limit 15 \
  --json databaseId,conclusion -q '.[] | select(.conclusion == "failure") | .databaseId'); do
  echo "===== failing run $run_id =====" >> "$CI_LOG"
  gh run view "$run_id" --log-failed >> "$CI_LOG" 2>&1 || true
done
FAILURES=$(tail -c "$CI_LOG_BUDGET" "$CI_LOG")

PROMPT=$(cat <<EOF
You are running non-interactively in a checkout of pull request #${PR} (branch ${BRANCH}) of vigilant-broccoli. Its CI is failing. Fix the code on this branch so the checks pass.

Failing CI output (checks summary followed by failed-step logs):

${FAILURES}

The PR's current body is:

---
${CURRENT_BODY}
---

Rules:
- Diagnose from the logs above, then make the minimal changes needed to make CI pass, following the repo conventions in CONTEXT.md.
- Formatting failures from the pre-commit job (trailing-whitespace, end-of-file-fixer, black) are auto-fixed for you by the calling script — do not hand-fix whitespace; spend your effort on real lint, test, build, or logic failures.
- Do not run any git or gh commands — committing, pushing, and updating the PR body are handled by the calling script.
- When finished, write $META_FILE containing only a JSON object with these string fields:
  - commit_type: one of feat, fix, ci, chore, docs, refactor, enhancement, security, infrastructure
  - commit_scope: the affected app/service/lib name, or "" when the change is not scoped to one
  - commit_message: capitalized, concise, focused on why not what, ending with a period
  - co_authored_by: the Co-Authored-By trailer line specified by your environment for the model authoring the commit
  - pr_summary: markdown bullet points replacing the PR's "## Summary" section — rewrite it to describe the PR's full, cumulative state (prior work plus this CI fix), not just this increment
  - pr_test_plan: markdown checklist replacing the PR's "## Test plan" section — same rule, cover the whole PR as it now stands
  - pr_suggestions: markdown bullet points for the PR "## Suggestions" section — follow-up recommendations for the reviewer (gaps, risks, related cleanups worth a separate PR), or "" when there are none — rewrite it to cover the whole PR as it now stands
EOF
)

claude -p "$PROMPT" --dangerously-skip-permissions --model "$MODEL" \
  --disallowedTools "Bash(git commit:*)" "Bash(git push:*)" "Bash(git checkout:*)" "Bash(git switch:*)" "Bash(gh:*)"

git checkout "$BRANCH"
[ "$(git rev-parse HEAD)" = "$BASE_SHA" ] || git reset --soft "$BASE_SHA"

bash "$PRE_COMMIT_HELPER"

if [ -z "$(git status --porcelain)" ]; then
  echo "ERROR: no changes produced — PR #${PR} CI failure was not fixed." >&2
  exit 1
fi

read_meta() { jq -r "$1 // empty" "$META_FILE" 2>/dev/null || true; }

COMMIT_TYPE=$(read_meta .commit_type)
COMMIT_SCOPE=$(read_meta .commit_scope)
COMMIT_MESSAGE=$(read_meta .commit_message)
TRAILER=$(read_meta .co_authored_by)
PR_SUMMARY=$(read_meta .pr_summary)
PR_TEST_PLAN=$(read_meta .pr_test_plan)
PR_SUGGESTIONS=$(read_meta .pr_suggestions)

case "$COMMIT_TYPE" in
  feat | fix | ci | chore | docs | refactor | enhancement | security | infrastructure) ;;
  *) COMMIT_TYPE="" ;;
esac

if [ -n "$COMMIT_TYPE" ] && [ -n "$COMMIT_MESSAGE" ]; then
  if [ -n "$COMMIT_SCOPE" ]; then
    COMMIT_SUBJECT="${COMMIT_TYPE}(${COMMIT_SCOPE}): ${COMMIT_MESSAGE}"
  else
    COMMIT_SUBJECT="${COMMIT_TYPE}: ${COMMIT_MESSAGE}"
  fi
else
  COMMIT_SUBJECT="ci: Fix failing checks on PR #${PR}."
fi

echo "$TRAILER" | grep -Eqi '^co-authored-by: .+ <.+>$' || TRAILER="$FALLBACK_TRAILER"

git add -A
git commit -m "$COMMIT_SUBJECT" -m "$TRAILER"
git push

if [ -n "${GITHUB_ACTIONS:-}" ]; then
  HISTORY_SOURCE="GitHub Actions"
else
  HISTORY_SOURCE="Docker sandbox (local)"
fi

NEW_BODY=$(CURRENT_BODY="$CURRENT_BODY" PR_SUMMARY="$PR_SUMMARY" PR_TEST_PLAN="$PR_TEST_PLAN" PR_SUGGESTIONS="$PR_SUGGESTIONS" \
  HISTORY_SOURCE="$HISTORY_SOURCE" HISTORY_COMMAND="agentic:pr:fix" HISTORY_PROMPT="Fix failing CI." \
  HISTORY_SUMMARY="$COMMIT_SUBJECT" HISTORY_DATE="$(date -u +%Y-%m-%d)" \
  python3 "$MERGE_BODY_HELPER")
gh pr edit "$PR" --body "$NEW_BODY"
