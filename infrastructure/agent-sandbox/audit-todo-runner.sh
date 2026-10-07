#!/bin/bash
set -euo pipefail

if [ $# -gt 0 ]; then
  echo "Usage: audit-todo-runner.sh" >&2
  exit 1
fi

MODEL=${SOLVE_MODEL:-sonnet}
REPO_DIR="$HOME/vigilant-broccoli"
META_FILE=/tmp/audit-todo-meta.json
BRANCH="agent/todo-audit-$(date +%s)"
PR_FOOTER='🤖 Generated with [Claude Code](https://claude.com/claude-code)'
FALLBACK_TRAILER='Co-authored-by: Claude <noreply@anthropic.com>'

cd "$REPO_DIR"
SKILL_INSTRUCTIONS=$(cat "$REPO_DIR/setup/dotfiles/agent-skills/agentic-pr-create-todo-audit/SKILL.md")

git checkout -b "$BRANCH"
BASE_SHA=$(git rev-parse HEAD)
rm -f "$META_FILE"

PROMPT=$(cat <<EOF
You are running non-interactively in a fresh clone of vigilant-broccoli, on a dedicated branch. Audit the repo root TODO.md for entries that no longer match the codebase, and correct it in place.

Follow these shared task instructions:

$SKILL_INSTRUCTIONS

Sandbox execution rules:
- You are already inside the unattended sandbox mentioned in the skill; complete the task here without launching another sandbox.
- Branching, committing, pushing, and opening the PR are handled by the calling script. Do not run mutating git commands or any gh commands.
- The only exception to the skill's output scope is $META_FILE, outside the checkout. Even for a clean audit, write the metadata with empty resolved/drifted lists; the calling script exits without opening a PR.

When finished, write $META_FILE containing only a JSON object with these fields:
  - resolved: array of objects {id, reason} for rows you deleted, reason citing the evidence that the condition is gone
  - drifted: array of objects {id, change} for rows you rewrote, change naming what was wrong
  - accurate_count: number of rows you verified as still accurate
  - commit_message: capitalized, concise, focused on why the correction was needed, ending with a period
  - co_authored_by: the Co-Authored-By trailer line specified by your environment for the model authoring the commit
  - pr_title: the pull request title
  - pr_summary: markdown bullet points for the PR "## Summary" section, listing each resolved and drifted row by id with its evidence
  - pr_next_steps: markdown checklist for the PR "## Next steps" section — what's left for the human (review, then merge)
  - pr_suggestions: markdown bullet points for the PR "## Suggestions" section — follow-up recommendations for the reviewer (gaps, risks, related cleanups worth a separate PR), or "" when there are none
EOF
)

claude -p "$PROMPT" --dangerously-skip-permissions --model "$MODEL" \
  --disallowedTools "Bash(git commit:*)" "Bash(git push:*)" "Bash(git checkout:*)" "Bash(git switch:*)" "Bash(gh:*)"

git checkout "$BRANCH"
[ "$(git rev-parse HEAD)" = "$BASE_SHA" ] || git reset --soft "$BASE_SHA"

if [ -n "$(git status --porcelain -- ':(exclude)TODO.md')" ]; then
  echo "ERROR: changes outside TODO.md were made; only TODO.md should change." >&2
  git status --porcelain >&2
  exit 1
fi

# An audit that finds nothing is a success, not a no-op failure: exit before the
# PR machinery rather than opening an empty PR for the owner to close.
if [ -z "$(git status --porcelain -- TODO.md)" ]; then
  echo "AUDIT_CLEAN: every TODO.md row still matches the codebase — no PR opened."
  exit 0
fi

read_meta() { jq -r "$1 // empty" "$META_FILE" 2>/dev/null || true; }

COMMIT_MESSAGE=$(read_meta .commit_message)
TRAILER=$(read_meta .co_authored_by)
PR_TITLE=$(read_meta .pr_title)
PR_SUMMARY=$(read_meta .pr_summary)
PR_NEXT_STEPS=$(read_meta .pr_next_steps)
PR_SUGGESTIONS=$(read_meta .pr_suggestions)
RESOLVED_COUNT=$(read_meta '.resolved | length')
DRIFTED_COUNT=$(read_meta '.drifted | length')

# Every id present before the run must still be present unless the agent listed
# it as resolved: a row silently dropped by a bad table rewrite is invisible in
# review once the diff is large, and the id is the only handle solve-todo has.
mapfile -t BEFORE_IDS < <(git show "$BASE_SHA:TODO.md" | grep -oE '^\| [0-9a-f]{6} \|' | grep -oE '[0-9a-f]{6}' | sort)
mapfile -t AFTER_IDS < <(grep -oE '^\| [0-9a-f]{6} \|' TODO.md | grep -oE '[0-9a-f]{6}' | sort)
mapfile -t CLAIMED_IDS < <(jq -r '.resolved[]?.id // empty' "$META_FILE" 2>/dev/null | sort)
UNEXPLAINED=$(comm -23 <(comm -23 <(printf '%s\n' "${BEFORE_IDS[@]}") <(printf '%s\n' "${AFTER_IDS[@]}")) <(printf '%s\n' "${CLAIMED_IDS[@]}"))
if [ -n "$UNEXPLAINED" ]; then
  echo "ERROR: these TODO ids vanished without being reported as resolved:" >&2
  echo "$UNEXPLAINED" >&2
  exit 1
fi

NEW_IDS=$(comm -13 <(printf '%s\n' "${BEFORE_IDS[@]}") <(printf '%s\n' "${AFTER_IDS[@]}"))
if [ -n "$NEW_IDS" ]; then
  echo "ERROR: the audit added or renumbered TODO ids, which breaks the solve handle:" >&2
  echo "$NEW_IDS" >&2
  exit 1
fi

if [ -n "$COMMIT_MESSAGE" ]; then
  COMMIT_SUBJECT="docs: ${COMMIT_MESSAGE}"
else
  COMMIT_SUBJECT="docs: Realign TODO.md with the current codebase."
fi

echo "$TRAILER" | grep -Eqi '^co-authored-by: .+ <.+>$' || TRAILER="$FALLBACK_TRAILER"
[ -n "$PR_TITLE" ] || PR_TITLE="$COMMIT_SUBJECT"
[ -n "$PR_SUMMARY" ] || PR_SUMMARY="- Removed ${RESOLVED_COUNT:-0} resolved and corrected ${DRIFTED_COUNT:-0} drifted TODO.md rows."
[ -n "$PR_NEXT_STEPS" ] || PR_NEXT_STEPS="- [ ] Confirm each removed row was genuinely resolved against the cited files, then merge"

bash "$REPO_DIR/infrastructure/agent-sandbox/run-pre-commit.sh"

git add TODO.md
git commit -m "$COMMIT_SUBJECT" -m "$TRAILER"
git push -u origin "$BRANCH"

if [ -n "${GITHUB_ACTIONS:-}" ]; then
  HISTORY_SOURCE="GitHub Actions"
else
  HISTORY_SOURCE="Docker sandbox (local)"
fi

PR_BODY=$(CURRENT_BODY="$PR_FOOTER" PR_SUMMARY="$PR_SUMMARY" PR_NEXT_STEPS="$PR_NEXT_STEPS" PR_SUGGESTIONS="$PR_SUGGESTIONS" \
  HISTORY_SOURCE="$HISTORY_SOURCE" HISTORY_COMMAND="agentic-pr-create-todo-audit" \
  HISTORY_PROMPT="Audit every row in every section." \
  HISTORY_SUMMARY="$COMMIT_SUBJECT" HISTORY_DATE="$(date -u +%Y-%m-%d)" \
  python3 "$REPO_DIR/infrastructure/agent-sandbox/merge-pr-body.py")

gh pr create --title "$PR_TITLE" --body "$PR_BODY"
