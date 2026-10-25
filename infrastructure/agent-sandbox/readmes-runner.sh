#!/bin/bash
set -euo pipefail

if [ $# -gt 0 ]; then
  echo "Usage: readmes-runner.sh" >&2
  exit 1
fi

MODEL=${SOLVE_MODEL:-sonnet}
REPO_DIR="$HOME/vigilant-broccoli"
META_FILE=/tmp/readmes-meta.json
BRANCH="agent/readmes-$(date +%s)"
MAX_CHANGED_FILES=20
PR_FOOTER='🤖 Generated with [Claude Code](https://claude.com/claude-code)'
FALLBACK_TRAILER='Co-authored-by: Claude <noreply@anthropic.com>'

cd "$REPO_DIR"
SKILL_INSTRUCTIONS=$(cat "$REPO_DIR/setup/dotfiles/agent-skills/update-readmes/SKILL.md")
# shellcheck source=no-changes.sh
. "$REPO_DIR/infrastructure/agent-sandbox/no-changes.sh"

git checkout -b "$BRANCH"
BASE_SHA=$(git rev-parse HEAD)
rm -f "$META_FILE"

PROMPT=$(cat <<EOF
You are running non-interactively in a fresh clone of vigilant-broccoli, on a dedicated branch. Run the update-readmes skill below against docs/app-readme-pattern.md: refresh README.md files and the generated repo counts only where they drifted from the current code.

Follow these shared task instructions:

$SKILL_INSTRUCTIONS

Sandbox execution rules:
- You are already inside the unattended sandbox mentioned in the skill; complete the task here without launching another sandbox.
- Branching, committing, pushing, and opening the PR are handled by the calling script. Do not run mutating git commands or any gh commands.
- Edit at most $MAX_CHANGED_FILES files, only README.md files and the copies of the generated repo counts that `pnpm repo-stats` rewrites (run it, never hand-edit the counts). Never edit TODO.md. Prefer the most clearly drifted READMEs and list the rest as skipped candidates.
- The calling script rejects the run if any other file changed or if more than $MAX_CHANGED_FILES files changed.
- Check everything the skill covers before choosing what to edit; do not stop after one kind of check. Record anything in scope you did not check or edit as a skipped candidate with the reason.
- The only exception to the skill's output scope is $META_FILE, outside the checkout. Even for a clean run, write the metadata with empty updated/skipped lists; the calling script exits without opening a PR.

When finished, write $META_FILE containing only a JSON object with these fields:
  - updated: array of objects {path, change, evidence} for every README or count edit, evidence being the code or config the edit was derived from
  - skipped: array of objects {path, reason} for candidates you left in place
  - commit_message: capitalized, concise, focused on why the READMEs had drifted, ending with a period
  - co_authored_by: the Co-Authored-By trailer line specified by your environment for the model authoring the commit
  - pr_title: the pull request title in the form "<committype>(<scope>): <Message>." (scope omitted when unscoped)
  - pr_summary: markdown for the PR "## Summary" section — one bullet per updated file with its evidence, then a "### Skipped candidates" subsection listing each skipped candidate with its reason
  - pr_next_steps: markdown checklist for the PR "## Next steps" section — what's left for the human (spot-check the derived entries, watch CI to green, then merge)
  - pr_suggestions: markdown bullet points for the PR "## Suggestions" section — only optional follow-up for the reviewer (related cleanups worth a separate PR), or "" when there are none. Never suggest work this scheduled job covers, such as candidates over the cap or areas you did not check: list those as skipped candidates, since the next scheduled run picks them up.
  - pr_concerns: markdown bullet points for the PR "## Concerns" section — problems the reviewer must weigh before merging (risks, known limitations, unverified behavior, unresolved questions, assumptions that may be wrong), or "" when there are none. Keep these out of pr_suggestions, which is only for optional follow-up work
$NO_CHANGES_FIELD
EOF
)

claude -p "$PROMPT" --dangerously-skip-permissions --model "$MODEL" \
  --disallowedTools "Bash(git commit:*)" "Bash(git push:*)" "Bash(git checkout:*)" "Bash(git switch:*)" "Bash(gh:*)"

normalize_meta "$META_FILE"

git checkout "$BRANCH"
[ "$(git rev-parse HEAD)" = "$BASE_SHA" ] || git reset --soft "$BASE_SHA"

# A run that finds no drift is a success: exit before the PR
# machinery rather than opening an empty PR for the owner to close.
if [ -z "$(git status --porcelain)" ]; then
  echo "README_CLEAN: no README or generated repo count drifted — no PR opened."
  no_changes_report "$META_FILE" || true
  exit 0
fi

git add -A

# Only READMEs and the repo-stats copies may change; anything else (TODO.md
# included) is outside this operation's scope and fails the run.
OUT_OF_SCOPE=$(git diff --cached --name-only | grep -vE '(^|/)README\.md$|^projects/nx-workspace/apps/ui/personal-website-react/src/app/content/about\.md$|^projects/nx-workspace/libs/@vigilant-broccoli/resume/src/resume\.json$' || true)
if [ -n "$OUT_OF_SCOPE" ]; then
  echo "ERROR: the README refresh touched files outside READMEs and generated repo counts:" >&2
  echo "$OUT_OF_SCOPE" >&2
  exit 1
fi

CHANGED_COUNT=$(git diff --cached --name-only | wc -l)
if [ "$CHANGED_COUNT" -gt "$MAX_CHANGED_FILES" ]; then
  echo "ERROR: $CHANGED_COUNT files changed, over the $MAX_CHANGED_FILES-file cap that keeps a README refresh reviewable." >&2
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
UPDATED_COUNT=$(read_meta '.updated | length')
SKIPPED_COUNT=$(read_meta '.skipped | length')

if [ -n "$COMMIT_MESSAGE" ]; then
  COMMIT_SUBJECT="docs: ${COMMIT_MESSAGE}"
else
  COMMIT_SUBJECT="docs: Refresh READMEs and generated repo counts."
fi

echo "$TRAILER" | grep -Eqi '^co-authored-by: .+ <.+>$' || TRAILER="$FALLBACK_TRAILER"
[ -n "$PR_TITLE" ] || PR_TITLE="$COMMIT_SUBJECT"
[ -n "$PR_SUMMARY" ] || PR_SUMMARY="- Updated ${UPDATED_COUNT:-0} drifted entries and skipped ${SKIPPED_COUNT:-0} uncertain candidates across ${CHANGED_COUNT} files."
[ -n "$PR_NEXT_STEPS" ] || PR_NEXT_STEPS="- [ ] Spot-check the derived entries in each README, then merge once CI is green"

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
  HISTORY_SOURCE="$HISTORY_SOURCE" HISTORY_COMMAND="agentic-pr-create-readmes" \
  HISTORY_PROMPT="Refresh READMEs and generated repo counts against docs/app-readme-pattern.md." \
  HISTORY_SUMMARY="$COMMIT_SUBJECT" HISTORY_DATE="$(date -u +%Y-%m-%d)" \
  python3 "$REPO_DIR/infrastructure/agent-sandbox/merge-pr-body.py")

PR_URL=$(gh pr create --title "$PR_TITLE" --body "$PR_BODY")
echo "$PR_URL"
printf 'PR_URL::%s\n' "$PR_URL"
emit_pr_files "$BASE_SHA"
