#!/bin/bash
set -euo pipefail

if [ $# -gt 0 ]; then
  echo "Usage: prune-runner.sh" >&2
  exit 1
fi

MODEL=${SOLVE_MODEL:-sonnet}
REPO_DIR="$HOME/vigilant-broccoli"
META_FILE=/tmp/prune-meta.json
BRANCH="agent/prune-$(date +%s)"
MAX_CHANGED_FILES=50
PR_FOOTER='🤖 Generated with [Claude Code](https://claude.com/claude-code)'
FALLBACK_TRAILER='Co-authored-by: Claude <noreply@anthropic.com>'

cd "$REPO_DIR"
SKILL_INSTRUCTIONS=$(cat "$REPO_DIR/setup/dotfiles/agent-skills/agentic-pr-create-prune/SKILL.md")

git checkout -b "$BRANCH"
BASE_SHA=$(git rev-parse HEAD)
rm -f "$META_FILE"

PROMPT=$(cat <<EOF
You are running non-interactively in a fresh clone of vigilant-broccoli, on a dedicated branch. Prune dead code, unused dependencies and stale documentation that verifiably nothing references.

Follow these shared task instructions:

$SKILL_INSTRUCTIONS

Sandbox execution rules:
- You are already inside the unattended sandbox mentioned in the skill; complete the task here without launching another sandbox.
- Branching, committing, pushing, and opening the PR are handled by the calling script. Do not run mutating git commands or any gh commands.
- The calling script rejects the run if TODO.md, a migrations directory or Terraform state changed, if a file under notes/ was added, deleted or renamed, or if more than $MAX_CHANGED_FILES files changed.
- The only exception to the skill's output scope is $META_FILE, outside the checkout. Even for a clean run, write the metadata with empty removed/skipped lists; the calling script exits without opening a PR.

When finished, write $META_FILE containing only a JSON object with these fields:
  - removed: array of objects {category, path, evidence} for every removal or fix, evidence being the grep command and its zero-match result (or the broken link target)
  - skipped: array of objects {path, reason} for candidates you left in place
  - commit_message: capitalized, concise, focused on why the pruning was needed, ending with a period
  - co_authored_by: the Co-Authored-By trailer line specified by your environment for the model authoring the commit
  - pr_title: the pull request title
  - pr_summary: markdown for the PR "## Summary" section — one "### <category>" subsection per category with removals, each item a bullet with its zero-reference evidence, then a "### Skipped candidates" subsection listing each skipped candidate with its reason
  - pr_next_steps: markdown checklist for the PR "## Next steps" section — what's left for the human (spot-check the evidence, watch CI to green, then merge)
  - pr_suggestions: markdown bullet points for the PR "## Suggestions" section — follow-up recommendations for the reviewer (candidates over the file cap, related cleanups worth a separate PR), or "" when there are none
EOF
)

claude -p "$PROMPT" --dangerously-skip-permissions --model "$MODEL" \
  --disallowedTools "Bash(git commit:*)" "Bash(git push:*)" "Bash(git checkout:*)" "Bash(git switch:*)" "Bash(gh:*)"

git checkout "$BRANCH"
[ "$(git rev-parse HEAD)" = "$BASE_SHA" ] || git reset --soft "$BASE_SHA"

# A run that finds nothing provably dead is a success: exit before the PR
# machinery rather than opening an empty PR for the owner to close.
if [ -z "$(git status --porcelain)" ]; then
  echo "PRUNE_CLEAN: no candidate survived zero-reference verification — no PR opened."
  exit 0
fi

git add -A

# The skill's guardrails are re-checked here because a wrong deletion in these
# paths is unrecoverable (migrations, state) or owned by another operation
# (TODO.md belongs to agentic-pr-create-todo-audit).
FORBIDDEN=$(git diff --cached --name-only -- TODO.md ':(glob)**/migrations/**' ':(glob)**/*.tfstate' ':(glob)**/*.tfstate.*')
if [ -n "$FORBIDDEN" ]; then
  echo "ERROR: the prune touched paths it must never change:" >&2
  echo "$FORBIDDEN" >&2
  exit 1
fi

NOTES_STRUCTURAL=$(git diff --cached --name-status -- notes | grep -v '^M' || true)
if [ -n "$NOTES_STRUCTURAL" ]; then
  echo "ERROR: notes/ may only have links fixed, not files added, deleted or renamed:" >&2
  echo "$NOTES_STRUCTURAL" >&2
  exit 1
fi

CHANGED_COUNT=$(git diff --cached --name-only | wc -l)
if [ "$CHANGED_COUNT" -gt "$MAX_CHANGED_FILES" ]; then
  echo "ERROR: $CHANGED_COUNT files changed, over the $MAX_CHANGED_FILES-file cap that keeps a prune reviewable." >&2
  exit 1
fi

read_meta() { jq -r "$1 // empty" "$META_FILE" 2>/dev/null || true; }

COMMIT_MESSAGE=$(read_meta .commit_message)
TRAILER=$(read_meta .co_authored_by)
PR_TITLE=$(read_meta .pr_title)
PR_SUMMARY=$(read_meta .pr_summary)
PR_NEXT_STEPS=$(read_meta .pr_next_steps)
PR_SUGGESTIONS=$(read_meta .pr_suggestions)
REMOVED_COUNT=$(read_meta '.removed | length')
SKIPPED_COUNT=$(read_meta '.skipped | length')

if [ -n "$COMMIT_MESSAGE" ]; then
  COMMIT_SUBJECT="chore: ${COMMIT_MESSAGE}"
else
  COMMIT_SUBJECT="chore: Prune dead code and stale documentation."
fi

echo "$TRAILER" | grep -Eqi '^co-authored-by: .+ <.+>$' || TRAILER="$FALLBACK_TRAILER"
[ -n "$PR_TITLE" ] || PR_TITLE="$COMMIT_SUBJECT"
[ -n "$PR_SUMMARY" ] || PR_SUMMARY="- Pruned ${REMOVED_COUNT:-0} unreferenced items and skipped ${SKIPPED_COUNT:-0} uncertain candidates across ${CHANGED_COUNT} files."
[ -n "$PR_NEXT_STEPS" ] || PR_NEXT_STEPS="- [ ] Spot-check the zero-reference evidence for each removal, then merge once CI is green"

bash "$REPO_DIR/infrastructure/agent-sandbox/run-pre-commit.sh"

git add -A
git commit -m "$COMMIT_SUBJECT" -m "$TRAILER"
git push -u origin "$BRANCH"

if [ -n "${GITHUB_ACTIONS:-}" ]; then
  HISTORY_SOURCE="GitHub Actions"
else
  HISTORY_SOURCE="Docker sandbox (local)"
fi

PR_BODY=$(CURRENT_BODY="$PR_FOOTER" PR_SUMMARY="$PR_SUMMARY" PR_NEXT_STEPS="$PR_NEXT_STEPS" PR_SUGGESTIONS="$PR_SUGGESTIONS" \
  HISTORY_SOURCE="$HISTORY_SOURCE" HISTORY_COMMAND="agentic-pr-create-prune" \
  HISTORY_PROMPT="Prune dead code, unused dependencies and stale documentation repo-wide." \
  HISTORY_SUMMARY="$COMMIT_SUBJECT" HISTORY_DATE="$(date -u +%Y-%m-%d)" \
  python3 "$REPO_DIR/infrastructure/agent-sandbox/merge-pr-body.py")

PR_URL=$(gh pr create --title "$PR_TITLE" --body "$PR_BODY")
echo "$PR_URL"
printf 'PR_URL::%s\n' "$PR_URL"
