#!/bin/bash
set -euo pipefail

PR=${1:?Usage: fix-pr-runner.sh <PR_NUMBER_OR_URL>}
MODEL=${SOLVE_MODEL:-sonnet}
REPO_DIR="$HOME/vigilant-broccoli"
META_FILE=/tmp/fix-meta.json
CI_LOG=/tmp/pr-ci-failures.log
CI_LOG_BUDGET=20000
PR_FOOTER='🤖 Generated with [Claude Code](https://claude.com/claude-code)'
FALLBACK_TRAILER='Co-authored-by: Claude <noreply@anthropic.com>'
PRE_COMMIT_HELPER=/tmp/run-pre-commit.sh

cd "$REPO_DIR"

# Stash the helper outside the working tree before checkout — the PR branch may predate it,
# and gh pr checkout would otherwise leave us on a branch where the helper path doesn't exist.
cp "$REPO_DIR/infrastructure/agent-sandbox/run-pre-commit.sh" "$PRE_COMMIT_HELPER"

git fetch origin --quiet
gh pr checkout "$PR"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
BASE_SHA=$(git rev-parse HEAD)
rm -f "$META_FILE"

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

Rules:
- Diagnose from the logs above, then make the minimal changes needed to make CI pass, following the repo conventions in CLAUDE.md.
- Formatting failures from the pre-commit job (trailing-whitespace, end-of-file-fixer, black) are auto-fixed for you by the calling script — do not hand-fix whitespace; spend your effort on real lint, test, build, or logic failures.
- Do not run any git or gh commands — committing, pushing, and commenting are handled by the calling script.
- When finished, write $META_FILE containing only a JSON object with these string fields:
  - commit_type: one of feat, fix, ci, chore, docs, refactor, enhancement, security, infrastructure
  - commit_scope: the affected app/service/lib name, or "" when the change is not scoped to one
  - commit_message: capitalized, concise, focused on why not what, ending with a period
  - co_authored_by: the Co-Authored-By trailer line specified by your environment for the model authoring the commit
  - pr_comment: one short sentence describing what you changed to fix CI, for a PR comment
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
PR_COMMENT=$(read_meta .pr_comment)

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

[ -n "$PR_COMMENT" ] && gh pr comment "$PR" --body "$PR_COMMENT

$PR_FOOTER" || true
