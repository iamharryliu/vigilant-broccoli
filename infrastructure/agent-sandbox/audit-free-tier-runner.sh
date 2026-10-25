#!/bin/bash
set -euo pipefail

if [ $# -gt 0 ]; then
  echo "Usage: audit-free-tier-runner.sh" >&2
  exit 1
fi

MODEL=${SOLVE_MODEL:-sonnet}
REPO_DIR="$HOME/vigilant-broccoli"
META_FILE=/tmp/audit-free-tier-meta.json
BRANCH="agent/audit-free-tier-$(date +%s)"
MAX_CHANGED_FILES=10
PR_FOOTER='🤖 Generated with [Claude Code](https://claude.com/claude-code)'
FALLBACK_TRAILER='Co-authored-by: Claude <noreply@anthropic.com>'

cd "$REPO_DIR"
SKILL_INSTRUCTIONS=$(cat "$REPO_DIR/setup/dotfiles/agent-skills/agentic-pr-create-free-tier-audit/SKILL.md")
# shellcheck source=no-changes.sh
. "$REPO_DIR/infrastructure/agent-sandbox/no-changes.sh"

git checkout -b "$BRANCH"
BASE_SHA=$(git rev-parse HEAD)
rm -f "$META_FILE"

PROMPT=$(cat <<EOF
You are running non-interactively in a fresh clone of vigilant-broccoli, on a dedicated branch. Audit free-tier documentation so every cloud service in use has limits documented from verifiable sources.

Follow these shared task instructions:

$SKILL_INSTRUCTIONS

Sandbox execution rules:
- You are already inside the unattended sandbox mentioned in the skill; complete the task here without launching another sandbox.
- Branching, committing, pushing, and opening the PR are handled by the calling script. Do not run mutating git commands or any gh commands.
- The calling script rejects the run if any non-Markdown file or TODO.md changed, if a file was added, deleted or renamed, or if more than $MAX_CHANGED_FILES files changed.
- Check everything the skill covers before choosing what to edit; do not stop after one kind of check. Record anything in scope you did not check or edit as a skipped candidate with the reason.
- The only exception to the skill's output scope is $META_FILE, outside the checkout. Even for a clean run, write the metadata with empty changes/skipped lists; the calling script exits without opening a PR.

When finished, write $META_FILE containing only a JSON object with these fields:
  - changes: array of objects {service, path, evidence, source} for every added or corrected entry, evidence being the file proving the service is in use and source the URL or repo section each limit came from
  - skipped: array of objects {path, reason} for candidates you left in place
  - commit_message: capitalized, concise, focused on why the free-tier docs needed updating, ending with a period
  - co_authored_by: the Co-Authored-By trailer line specified by your environment for the model authoring the commit
  - pr_title: the pull request title in the form "<committype>(<scope>): <Message>." (scope omitted when unscoped)
  - pr_summary: markdown for the PR "## Summary" section — one "### <service>" subsection per changed service with its evidence of use and the source of each limit, then a "### Skipped candidates" subsection listing each skipped candidate with its reason
  - pr_next_steps: markdown checklist for the PR "## Next steps" section — what's left for the human (spot-check each limit against its cited source, watch CI to green, then merge)
  - pr_suggestions: markdown bullet points for the PR "## Suggestions" section — only optional follow-up for the reviewer (services whose limits could not be verified, related cleanups worth a separate PR), or "" when there are none. Never suggest work this scheduled job covers, such as candidates over the cap or areas you did not check: list those as skipped candidates, since the next scheduled run picks them up.
  - pr_concerns: markdown bullet points for the PR "## Concerns" section — problems the reviewer must weigh before merging (risks, known limitations, unverified behavior, unresolved questions, assumptions that may be wrong), or "" when there are none. Keep these out of pr_suggestions, which is only for optional follow-up work
$NO_CHANGES_FIELD
EOF
)

claude -p "$PROMPT" --dangerously-skip-permissions --model "$MODEL" \
  --disallowedTools "Bash(git commit:*)" "Bash(git push:*)" "Bash(git checkout:*)" "Bash(git switch:*)" "Bash(gh:*)"

normalize_meta "$META_FILE"

git checkout "$BRANCH"
[ "$(git rev-parse HEAD)" = "$BASE_SHA" ] || git reset --soft "$BASE_SHA"

# A run that finds every service documented and current is a success: exit
# before the PR machinery rather than opening an empty PR for the owner to close.
if [ -z "$(git status --porcelain)" ]; then
  echo "AUDIT_CLEAN: every cloud service already has current free-tier documentation — no PR opened."
  no_changes_report "$META_FILE" || true
  exit 0
fi

git add -A

# The skill's scope is re-checked here: only Markdown may change, and TODO.md
# belongs to agentic-pr-create-todo-audit. Structural changes would break
# notes/ reachability and the Doc Map links this audit does not own.
OUT_OF_SCOPE=$(git diff --cached --name-only -- . ':(exclude)*.md' ; git diff --cached --name-only -- TODO.md)
if [ -n "$OUT_OF_SCOPE" ]; then
  echo "ERROR: the audit touched paths outside its scope:" >&2
  echo "$OUT_OF_SCOPE" >&2
  exit 1
fi

STRUCTURAL=$(git diff --cached --name-status | grep -v '^M' || true)
if [ -n "$STRUCTURAL" ]; then
  echo "ERROR: files may only be modified, not added, deleted, renamed or retyped:" >&2
  echo "$STRUCTURAL" >&2
  exit 1
fi

CHANGED_COUNT=$(git diff --cached --name-only | wc -l)
if [ "$CHANGED_COUNT" -gt "$MAX_CHANGED_FILES" ]; then
  echo "ERROR: $CHANGED_COUNT files changed, over the $MAX_CHANGED_FILES-file cap that keeps the audit reviewable." >&2
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
CHANGED_ITEMS=$(read_meta '.changes | length')
SKIPPED_COUNT=$(read_meta '.skipped | length')

if [ -n "$COMMIT_MESSAGE" ]; then
  COMMIT_SUBJECT="docs: ${COMMIT_MESSAGE}"
else
  COMMIT_SUBJECT="docs: Audit free-tier documentation."
fi

echo "$TRAILER" | grep -Eqi '^co-authored-by: .+ <.+>$' || TRAILER="$FALLBACK_TRAILER"
[ -n "$PR_TITLE" ] || PR_TITLE="$COMMIT_SUBJECT"
[ -n "$PR_SUMMARY" ] || PR_SUMMARY="- Updated ${CHANGED_ITEMS:-0} free-tier entries and skipped ${SKIPPED_COUNT:-0} unverifiable candidates across ${CHANGED_COUNT} files."
[ -n "$PR_NEXT_STEPS" ] || PR_NEXT_STEPS="- [ ] Spot-check each limit against its cited source, then merge once CI is green"

bash "$REPO_DIR/infrastructure/agent-sandbox/run-pre-commit.sh"

git add -A
git commit -m "$COMMIT_SUBJECT" -m "$TRAILER"
git push -u origin "$BRANCH"

if [ -n "${GITHUB_ACTIONS:-}" ]; then
  HISTORY_SOURCE="GitHub Actions"
else
  HISTORY_SOURCE="Docker sandbox (local)"
fi

PR_BODY=$(CURRENT_BODY="$PR_FOOTER" PR_SUMMARY="$PR_SUMMARY" PR_NEXT_STEPS="$PR_NEXT_STEPS" PR_CONCERNS="$PR_CONCERNS" PR_SUGGESTIONS="$PR_SUGGESTIONS" \
  HISTORY_SOURCE="$HISTORY_SOURCE" HISTORY_COMMAND="agentic-pr-create-free-tier-audit" \
  HISTORY_PROMPT="Audit free-tier documentation for every cloud service in use." \
  HISTORY_SUMMARY="$COMMIT_SUBJECT" HISTORY_DATE="$(date -u +%Y-%m-%d)" \
  python3 "$REPO_DIR/infrastructure/agent-sandbox/merge-pr-body.py")

PR_URL=$(gh pr create --title "$PR_TITLE" --body "$PR_BODY")
echo "$PR_URL"
printf 'PR_URL::%s\n' "$PR_URL"
emit_pr_files "$BASE_SHA"
