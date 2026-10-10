#!/bin/bash
set -euo pipefail

PR=${1:?Usage: update-pr-runner.sh <PR_NUMBER_OR_URL> <instruction>}
INSTRUCTION=${2:?Usage: update-pr-runner.sh <PR_NUMBER_OR_URL> <instruction>}
MODEL=${SOLVE_MODEL:-sonnet}
REPO_DIR=${REPO_DIR:-$HOME/vigilant-broccoli}
META_FILE=${META_FILE:-/tmp/update-meta.json}
PR_FOOTER='🤖 Generated with [Claude Code](https://claude.com/claude-code)'
FALLBACK_TRAILER='Co-authored-by: Claude <noreply@anthropic.com>'
PRE_COMMIT_HELPER=/tmp/run-pre-commit.sh
MERGE_BODY_HELPER=/tmp/merge-pr-body.py
CI_LOG=/tmp/pr-ci-failures.log
CI_LOG_BUDGET=20000

cd "$REPO_DIR"
SKILL_NAME=agentic-pr-update
FALLBACK_SUBJECT="chore: Apply requested update to PR #${PR}."
if [ -n "${SANDBOX_MERGE_MAIN:-}" ]; then
  SKILL_NAME=agentic-pr-update-resolve-conflicts
elif [ -n "${SANDBOX_FIX_CI:-}" ]; then
  SKILL_NAME=agentic-pr-update-fix-ci
  FALLBACK_SUBJECT="ci: Fix failing checks on PR #${PR}."
fi
SKILL_INSTRUCTIONS=$(cat "$REPO_DIR/setup/dotfiles/agent-skills/$SKILL_NAME/SKILL.md")
# Sourced before the PR checkout: the PR branch may predate this file.
# shellcheck source=pr-increments.sh
. "$(dirname "${BASH_SOURCE[0]}")/pr-increments.sh"

# Only a change instruction can ask for follow-up increments; CI fixes and
# conflict resolution stay on the one PR.
PLAN_ENABLED=0
[ "$SKILL_NAME" != agentic-pr-update ] || PLAN_ENABLED=1

# Stash the helpers outside the working tree before checkout — the PR branch may predate them,
# and gh pr checkout would otherwise leave us on a branch where the helper paths don't exist.
cp "$REPO_DIR/infrastructure/agent-sandbox/run-pre-commit.sh" "$PRE_COMMIT_HELPER"
cp "$REPO_DIR/infrastructure/agent-sandbox/merge-pr-body.py" "$MERGE_BODY_HELPER"

git fetch origin --quiet
gh pr checkout "$PR"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
BASE_SHA=$(git rev-parse HEAD)
rm -f "$META_FILE"

# --no-commit leaves MERGE_HEAD for the final `git commit`, so the result is a real merge
# commit; a plain change on top of BASE_SHA would leave the PR conflicted.
if [ -n "${SANDBOX_MERGE_MAIN:-}" ]; then
  git merge origin/main --no-commit --no-ff || true
fi

PR_TITLE=$(gh pr view "$PR" --json title -q .title 2>/dev/null || true)
PR_URL=$(gh pr view "$PR" --json url -q .url 2>/dev/null || true)
CURRENT_BODY=$(gh pr view "$PR" --json body -q .body 2>/dev/null || true)

SALVAGE_ENABLED=1
salvage_on_failure() {
  local exit_code=$? recovery_branch
  trap - EXIT
  set +e
  [ "$exit_code" -ne 0 ] && [ "$SALVAGE_ENABLED" = 1 ] || exit "$exit_code"
  recovery_branch="${BRANCH}-recovery-$(date +%s)"
  # A failed update must never publish unfinished work onto the target PR.
  if git checkout -b "$recovery_branch"; then
    inc_salvage "$recovery_branch" "$BRANCH" "$BASE_SHA" "${PR_TITLE:-Update PR #$PR}" "$INSTRUCTION" "$exit_code"
  else
    echo "ERROR: could not create a recovery branch; the target PR was not updated." >&2
    echo 'RESULT::salvage-branch-failed'
  fi
  local id
  for id in "${INC_ORDER[@]:1}"; do
    inc_emit_unpublished "$id" "the target PR update failed"
  done
  exit "$exit_code"
}
trap salvage_on_failure EXIT

# The agent cannot call gh, so failing CI output has to be collected here and
# handed over in the prompt.
CI_SECTION=""
if [ -n "${SANDBOX_CI_LOGS:-}" ]; then
  : > "$CI_LOG"
  gh pr checks "$PR" >> "$CI_LOG" 2>&1 || true
  # A token without Actions read access makes this fail; say so rather than
  # handing the agent an empty log.
  if ! FAILED_RUN_IDS=$(gh run list --branch "$BRANCH" --limit 15 \
    --json databaseId,conclusion -q '.[] | select(.conclusion == "failure") | .databaseId'); then
    echo "WARNING: could not list workflow runs for ${BRANCH}; the agent gets no failed-step logs." >&2
    FAILED_RUN_IDS=""
  fi
  for run_id in $FAILED_RUN_IDS; do
    echo "===== failing run $run_id =====" >> "$CI_LOG"
    gh run view "$run_id" --log-failed >> "$CI_LOG" 2>&1 || true
  done
  CI_SECTION=$(cat <<EOF

Failing CI output for this PR (checks summary followed by failed-step logs, truncated to the last ${CI_LOG_BUDGET} bytes):

$(tail -c "$CI_LOG_BUDGET" "$CI_LOG")

Formatting failures from the pre-commit job (trailing-whitespace, end-of-file-fixer, black) are auto-fixed by the calling script; spend your effort on real lint, test, build, or logic failures.
EOF
)
fi

PLAN_RULES=""
PLAN_FIELDS=""
if [ "$PLAN_ENABLED" = 1 ]; then
  PLAN_RULES="- Do not edit TODO.md: the runner removes exactly the rows you declare in todo_ids.
$(inc_plan_instructions update)"
  PLAN_FIELDS="
  - todo_ids: array of the TODO.md ids named in the instruction that this update fully resolves (omit or [] when none)
  - increments: the optional array of later increments described above"
fi

PROMPT=$(cat <<EOF
You are running non-interactively in a checkout of pull request #${PR}${PR_TITLE:+ ("${PR_TITLE}")} (branch ${BRANCH}) of vigilant-broccoli. Apply the following change to this PR's branch, building on the work already there:

${INSTRUCTION}
${CI_SECTION}

The PR's current body is:

---
${CURRENT_BODY}
---

Follow these shared task instructions:

$SKILL_INSTRUCTIONS

Sandbox execution rules:
- You are already inside the unattended sandbox mentioned in the skill; complete the task here without launching another sandbox.
- Do not run any git or gh commands — committing, pushing, and updating the PR body are handled by the calling script.
${PLAN_RULES}
- When finished, write $META_FILE containing only a JSON object with these fields (strings unless noted):
  - commit_type: one of feat, fix, ci, chore, docs, refactor, enhancement, security, infrastructure
  - commit_scope: the affected app/service/lib name, or "" when the change is not scoped to one
  - commit_message: capitalized, concise, focused on why not what, ending with a period
  - co_authored_by: the Co-Authored-By trailer line specified by your environment for the model authoring the commit
  - pr_summary: markdown bullet points replacing the PR's "## Summary" section — rewrite it to describe the PR's full, cumulative state (prior work plus this change), not just this increment
  - pr_next_steps: markdown checklist replacing the PR's "## Next steps" section — same rule, cover the whole PR as it now stands: remaining manual commands, spot checks, CI status, merging, and one ready-to-run \`pnpm agentic-pr-create --prompt "<task>"\` item per piece of work deliberately left out of every increment, or "- [ ] Merge once CI is green" when nothing else is left
  - pr_suggestions: markdown bullet points for the PR "## Suggestions" section — follow-up recommendations for the reviewer (gaps, risks, related cleanups worth a separate PR), or "" when there are none — rewrite it to cover the whole PR as it now stands${PLAN_FIELDS}
EOF
)

agent_invoke() {
  claude -p "$1" --dangerously-skip-permissions --model "$MODEL" \
    --disallowedTools "Bash(git commit:*)" "Bash(git push:*)" "Bash(git checkout:*)" "Bash(git switch:*)" "Bash(gh:*)"
}

agent_invoke "$PROMPT"

# Stage first: if the instruction involved resolving a merge conflict, the working
# tree may hold a fix for it that was never `git add`-ed (the model is disallowed
# from `git commit`, so it has no reason to stage). An unmerged index blocks the
# checkout below even onto the branch we're already on, so clear that first.
git add -A

# `git checkout` deletes MERGE_HEAD even when already on $BRANCH, which would turn the
# merge into a single-parent commit; save it here and restore it just before committing.
MERGE_HEAD_SHA=$(git rev-parse -q --verify MERGE_HEAD || true)

git checkout "$BRANCH"
[ "$(git rev-parse HEAD)" = "$BASE_SHA" ] || git reset --soft "$BASE_SHA"

INC_REQUEST=$INSTRUCTION
INC_SKILL_INSTRUCTIONS=$SKILL_INSTRUCTIONS
INC_ORDER=("$INC_CURRENT")
INC_BRANCH[$INC_CURRENT]=$BRANCH
INC_URL[$INC_CURRENT]=$PR_URL
INC_TITLE[$INC_CURRENT]=$PR_TITLE
INC_HISTORY_BASE_COMMAND="agentic-pr-update (follow-up increment)"
INC_HISTORY_COMMAND=$INC_HISTORY_BASE_COMMAND
if [ -n "${GITHUB_ACTIONS:-}" ]; then
  INC_HISTORY_SOURCE="GitHub Actions"
else
  INC_HISTORY_SOURCE="Docker sandbox (local)"
fi

if [ "$PLAN_ENABLED" = 1 ] && [ -n "$(git status --porcelain)" ]; then
  # Checked before anything is pushed, so a bad plan never leaves a partial set behind.
  inc_validate_plan "$META_FILE" "$BASE_SHA" "$INSTRUCTION" ""
  inc_load_plan "$META_FILE"
  RESOLVED_IDS=()
  while IFS= read -r resolved_id; do
    [ -z "$resolved_id" ] || RESOLVED_IDS+=("$resolved_id")
  done < <(inc_current_todo_ids "$META_FILE")
  inc_apply_todo_cleanup "$BASE_SHA" ${RESOLVED_IDS[@]+"${RESOLVED_IDS[@]}"}
  if [ "${#RESOLVED_IDS[@]}" -gt 0 ] && [ -z "$(git status --porcelain -- ':(exclude)TODO.md')" ]; then
    echo "ERROR: no changes besides TODO.md — ${RESOLVED_IDS[*]} not resolved." >&2
    exit 1
  fi
fi

bash "$PRE_COMMIT_HELPER"

if [ -z "$(git status --porcelain)" ]; then
  echo "ERROR: no changes produced — PR #${PR} was not updated." >&2
  exit 1
fi

read_meta() { jq -r "$1 // empty" "$META_FILE" 2>/dev/null || true; }

COMMIT_TYPE=$(read_meta .commit_type)
COMMIT_SCOPE=$(read_meta .commit_scope)
COMMIT_MESSAGE=$(read_meta .commit_message)
TRAILER=$(read_meta .co_authored_by)
PR_SUMMARY=$(read_meta .pr_summary)
PR_NEXT_STEPS=$(read_meta .pr_next_steps)
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
  COMMIT_SUBJECT="$FALLBACK_SUBJECT"
fi

echo "$TRAILER" | grep -Eqi '^co-authored-by: .+ <.+>$' || TRAILER="$FALLBACK_TRAILER"

git add -A
[ -z "$MERGE_HEAD_SHA" ] || echo "$MERGE_HEAD_SHA" >"$(git rev-parse --git-path MERGE_HEAD)"
SKIP=$INC_SKIP_COMMIT_HOOKS git commit -m "$COMMIT_SUBJECT" -m "$TRAILER"
git push
SALVAGE_ENABLED=0

HISTORY_SOURCE=$INC_HISTORY_SOURCE

NEW_BODY=$(CURRENT_BODY="$CURRENT_BODY" PR_SUMMARY="$PR_SUMMARY" PR_NEXT_STEPS="$PR_NEXT_STEPS" PR_SUGGESTIONS="$PR_SUGGESTIONS" \
  HISTORY_SOURCE="$HISTORY_SOURCE" HISTORY_COMMAND="$SKILL_NAME" HISTORY_PROMPT="$INSTRUCTION" \
  HISTORY_SUMMARY="$COMMIT_SUBJECT" HISTORY_DATE="$(date -u +%Y-%m-%d)" \
  python3 "$MERGE_BODY_HELPER")
gh pr edit "$PR" --body "$NEW_BODY"

# The target PR is already updated and pushed; follow-up increments are
# separate PRs, so a failure here leaves it untouched.
LATER_STATUS=0
if [ "${#INC_ORDER[@]}" -gt 1 ]; then
  echo "=== Follow-up increments ===" >&2
  inc_run_later || LATER_STATUS=1
  inc_refresh_stacks || true
fi
exit "$LATER_STATUS"
