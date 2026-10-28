#!/bin/bash
set -euo pipefail

if [ $# -gt 0 ]; then
  echo "Usage: comment-audit-runner.sh" >&2
  exit 1
fi

MODEL=${SOLVE_MODEL:-sonnet}
REPO_DIR="$HOME/vigilant-broccoli"
META_FILE=/tmp/comment-audit-meta.json
BRANCH="agent/comment-audit-$(date +%s)"
MAX_CHANGED_FILES=30
PR_FOOTER='🤖 Generated with [Claude Code](https://claude.com/claude-code)'
FALLBACK_TRAILER='Co-authored-by: Claude <noreply@anthropic.com>'

cd "$REPO_DIR"
SKILL_INSTRUCTIONS=$(cat "$REPO_DIR/setup/dotfiles/agent-skills/local-pr-create-comment-audit/SKILL.md")
# shellcheck source=no-changes.sh
. "$REPO_DIR/infrastructure/agent-sandbox/no-changes.sh"

git checkout -b "$BRANCH"
BASE_SHA=$(git rev-parse HEAD)
rm -f "$META_FILE"

PROMPT=$(cat <<EOF
You are running non-interactively in a fresh clone of vigilant-broccoli, on a dedicated branch. Enforce the repository comment rule: remove redundant comments and generator scaffolding, and keep comments that explain non-obvious reasons, constraints or traps.

Follow these shared task instructions:

$SKILL_INSTRUCTIONS

Sandbox execution rules:
- You are already inside the unattended sandbox mentioned in the skill; complete the task here without launching another sandbox.
- Branching, committing, pushing, and opening the PR are handled by the calling script. Do not run mutating git commands or any gh commands.
- The calling script rejects the run if TODO.md, a migrations directory or Terraform state changed, if any file was added, deleted or renamed, or if more than $MAX_CHANGED_FILES files changed.
- Check everything the skill covers before choosing what to edit; do not stop after one kind of check. Record anything in scope you did not check or edit as a skipped candidate with the reason.
- The only exception to the skill's output scope is $META_FILE, outside the checkout. Even for a clean run, write the metadata with empty edits/skipped lists; the calling script exits without opening a PR.

When finished, write $META_FILE containing only a JSON object with these fields:
  - edits: array of objects {path, removed, reason} for every comment removed or rewritten, removed being a short quote and reason why it is redundant scaffolding or restates the code
  - skipped: array of objects {path, reason} for candidates you left in place
  - commit_message: capitalized, concise, focused on why the comments needed trimming, ending with a period
  - co_authored_by: the Co-Authored-By trailer line specified by your environment for the model authoring the commit
  - pr_title: the pull request title in the form "<committype>(<scope>): <Message>." (scope omitted when unscoped)
  - pr_summary: markdown for the PR "## Summary" section — one "### <path>" subsection per changed file listing each comment removed or rewritten and why, then a "### Skipped candidates" subsection listing each skipped candidate with its reason
  - pr_next_steps: markdown checklist for the PR "## Next steps" section — what's left for the human (spot-check each removed comment, watch CI to green, then merge)
  - pr_suggestions: markdown bullet points for the PR "## Suggestions" section — only optional follow-up for the reviewer (related cleanups worth a separate PR), or "" when there are none. Never suggest work this scheduled job covers, such as candidates over the cap or areas you did not check: list those as skipped candidates, since the next scheduled run picks them up.
  - pr_concerns: markdown bullet points for the PR "## Concerns" section — problems the reviewer must weigh before merging (risks, known limitations, unverified behavior, unresolved questions, assumptions that may be wrong), or "" when there are none. Keep these out of pr_suggestions, which is only for optional follow-up work
$NO_CHANGES_FIELD
EOF
)

permission_args=(--permission-mode auto)
if [ "${SOLVE_PERMISSION_MODE:-auto}" = bypass ]; then
  permission_args=(--dangerously-skip-permissions)
fi

claude -p "$PROMPT" "${permission_args[@]}" --model "$MODEL" \
  --disallowedTools "Bash(git commit:*)" "Bash(git push:*)" "Bash(git checkout:*)" "Bash(git switch:*)" "Bash(gh:*)"

normalize_meta "$META_FILE"

git checkout "$BRANCH"
[ "$(git rev-parse HEAD)" = "$BASE_SHA" ] || git reset --soft "$BASE_SHA"

# A run that finds no violating comment is a success: exit before the PR
# machinery rather than opening an empty PR for the owner to close.
if [ -z "$(git status --porcelain)" ]; then
  echo "COMMENT_CLEAN: no comment violates the comment rule — no PR opened."
  no_changes_report "$META_FILE" || true
  exit 0
fi

git add -A

# The skill's guardrails are re-checked here because a wrong deletion in these
# paths is unrecoverable (migrations, state) or owned by another operation
# (TODO.md belongs to agentic-pr-create-todo-audit); comments in them are never worth the risk.
FORBIDDEN=$(git diff --cached --name-only -- TODO.md ':(glob)**/migrations/**' ':(glob)**/*.tfstate' ':(glob)**/*.tfstate.*')
if [ -n "$FORBIDDEN" ]; then
  echo "ERROR: the comment audit touched paths it must never change:" >&2
  echo "$FORBIDDEN" >&2
  exit 1
fi

STRUCTURAL=$(git diff --cached --name-status | grep -v '^M' || true)
if [ -n "$STRUCTURAL" ]; then
  echo "ERROR: a comment audit may only modify existing files, not add, delete, rename or retype them:" >&2
  echo "$STRUCTURAL" >&2
  exit 1
fi

CHANGED_COUNT=$(git diff --cached --name-only | wc -l)
if [ "$CHANGED_COUNT" -gt "$MAX_CHANGED_FILES" ]; then
  echo "ERROR: $CHANGED_COUNT files changed, over the $MAX_CHANGED_FILES-file cap that keeps a comment audit reviewable." >&2
  exit 1
fi

# shellcheck source=commit-subject.sh
. "$REPO_DIR/infrastructure/agent-sandbox/commit-subject.sh"
read_meta() { jq -r "$1 // empty" "$META_FILE" 2>/dev/null || true; }

COMMIT_MESSAGE=$(normalize_commit_message "$(read_meta .commit_message)")
TRAILER=$(read_meta .co_authored_by)
PR_TITLE=$(normalize_pr_title "$(read_meta .pr_title)")
PR_SUMMARY=$(read_meta .pr_summary)
PR_NEXT_STEPS=$(read_meta .pr_next_steps)
PR_CONCERNS=$(read_meta .pr_concerns)
PR_SUGGESTIONS=$(read_meta .pr_suggestions)
EDITED_COUNT=$(read_meta '.edits | length')
SKIPPED_COUNT=$(read_meta '.skipped | length')

if [ -n "$COMMIT_MESSAGE" ]; then
  COMMIT_SUBJECT="chore: ${COMMIT_MESSAGE}"
else
  COMMIT_SUBJECT="chore: Remove redundant code comments."
fi

echo "$TRAILER" | grep -Eqi '^co-authored-by: .+ <.+>$' || TRAILER="$FALLBACK_TRAILER"
[ -n "$PR_TITLE" ] || PR_TITLE="$COMMIT_SUBJECT"
[ -n "$PR_SUMMARY" ] || PR_SUMMARY="- Edited ${EDITED_COUNT:-0} comments and skipped ${SKIPPED_COUNT:-0} uncertain candidates across ${CHANGED_COUNT} files."
[ -n "$PR_NEXT_STEPS" ] || PR_NEXT_STEPS="- [ ] Spot-check each removed comment, then merge once CI is green"

bash "$REPO_DIR/infrastructure/agent-sandbox/run-pre-commit.sh"

git add -A
SKIP=$SKIP_COMMIT_HOOKS git commit -m "$COMMIT_SUBJECT" -m "$TRAILER"
git push -u origin "$BRANCH"

if [ -n "${GITHUB_ACTIONS:-}" ]; then
  HISTORY_SOURCE="GitHub Actions"
else
  HISTORY_SOURCE="Docker sandbox (local)"
fi

PR_BODY=$(CURRENT_BODY="$PR_FOOTER" PR_SUMMARY="$PR_SUMMARY" PR_NEXT_STEPS="$PR_NEXT_STEPS" PR_CONCERNS="$PR_CONCERNS" PR_SUGGESTIONS="$PR_SUGGESTIONS" \
  HISTORY_SOURCE="$HISTORY_SOURCE" HISTORY_COMMAND="agentic-pr-create-comment-audit" \
  HISTORY_PROMPT="Remove redundant comments and generator scaffolding repo-wide." \
  HISTORY_SUMMARY="$COMMIT_SUBJECT" HISTORY_DATE="$(date -u +%Y-%m-%d)" \
  python3 "$REPO_DIR/infrastructure/agent-sandbox/merge-pr-body.py")

PR_URL=$(gh pr create --title "$(guard_pr_title "$PR_TITLE" "${FALLBACK_SUBJECT:-}")" --body "$PR_BODY")
echo "$PR_URL"
printf 'PR_URL::%s\n' "$PR_URL"
emit_pr_files "$BASE_SHA"
