#!/bin/bash
set -euo pipefail

QUESTION=${1:?Usage: create-rnd-runner.sh <QUESTION>}
MODEL=${SOLVE_MODEL:-sonnet}
REPO_DIR="$HOME/vigilant-broccoli"
META_FILE=/tmp/rnd-meta.json
SLUG=$(echo "$QUESTION" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | sed 's/^-*//;s/-*$//' | cut -c1-40)
BRANCH="agent/rnd-${SLUG:-note}-$(date +%s)"
PR_FOOTER='🤖 Generated with [Claude Code](https://claude.com/claude-code)'
FALLBACK_TRAILER='Co-authored-by: Claude <noreply@anthropic.com>'

cd "$REPO_DIR"
SKILL_INSTRUCTIONS=$(cat "$REPO_DIR/setup/dotfiles/agent-skills/agentic-pr-create-rnd/SKILL.md")

git checkout -b "$BRANCH"
BASE_SHA=$(git rev-parse HEAD)
rm -f "$META_FILE"

PROMPT=$(cat <<EOF
You are running non-interactively in a fresh clone of vigilant-broccoli, on a dedicated branch. Write a concise R&D note under docs/rnd/ answering the following:

$QUESTION

Follow these shared task instructions:

$SKILL_INSTRUCTIONS

Sandbox execution rules:
- You are already inside the unattended sandbox mentioned in the skill; complete the task here without launching another sandbox.
- Do not run any git or gh commands and do not commit — branching, committing, pushing, and opening the PR are handled by the calling script.
- The only exception to the skill's output scope is $META_FILE, outside the checkout. When finished, write it containing only a JSON object with these string fields:
  - note_path: the repo-relative path of the note you created (e.g. docs/rnd/mobile-development-options.md)
  - commit_message: capitalized, concise, focused on what was researched, ending with a period
  - co_authored_by: the Co-Authored-By trailer line specified by your environment for the model authoring the commit
  - pr_title: the pull request title
  - pr_summary: markdown bullet points for the PR "## Summary" section
  - pr_next_steps: markdown checklist for the PR "## Next steps" section — what's left for the human (review, then merge)
  - pr_suggestions: markdown bullet points for the PR "## Suggestions" section — follow-up recommendations for the reviewer (gaps, risks, related cleanups worth a separate PR), or "" when there are none
EOF
)

claude -p "$PROMPT" --dangerously-skip-permissions --model "$MODEL" \
  --disallowedTools "Bash(git commit:*)" "Bash(git push:*)" "Bash(git checkout:*)" "Bash(git switch:*)" "Bash(gh:*)"

git checkout "$BRANCH"
[ "$(git rev-parse HEAD)" = "$BASE_SHA" ] || git reset --soft "$BASE_SHA"

if [ -z "$(git status --porcelain -- docs/rnd)" ]; then
  echo "ERROR: no R&D note was written under docs/rnd/." >&2
  exit 1
fi
if [ -n "$(git status --porcelain -- ':(exclude)docs/rnd')" ]; then
  echo "ERROR: changes outside docs/rnd/ were made; only docs/rnd/ should change." >&2
  git status --porcelain >&2
  exit 1
fi

# shellcheck source=commit-subject.sh
. "$REPO_DIR/infrastructure/agent-sandbox/commit-subject.sh"
read_meta() { jq -r "$1 // empty" "$META_FILE" 2>/dev/null || true; }

NOTE_PATH=$(read_meta .note_path)
COMMIT_MESSAGE=$(normalize_commit_message "$(read_meta .commit_message)")
TRAILER=$(read_meta .co_authored_by)
PR_TITLE=$(normalize_pr_title "$(read_meta .pr_title)")
PR_SUMMARY=$(read_meta .pr_summary)
PR_NEXT_STEPS=$(read_meta .pr_next_steps)
PR_SUGGESTIONS=$(read_meta .pr_suggestions)

if [ -n "$COMMIT_MESSAGE" ]; then
  COMMIT_SUBJECT="docs(rnd): ${COMMIT_MESSAGE}"
else
  COMMIT_SUBJECT="docs(rnd): Add R&D note for ${QUESTION}."
fi

echo "$TRAILER" | grep -Eqi '^co-authored-by: .+ <.+>$' || TRAILER="$FALLBACK_TRAILER"
[ -n "$PR_TITLE" ] || PR_TITLE="$COMMIT_SUBJECT"
[ -n "$PR_SUMMARY" ] || PR_SUMMARY="- Add R&D note${NOTE_PATH:+ (${NOTE_PATH})} for: ${QUESTION}"
[ -n "$PR_NEXT_STEPS" ] || PR_NEXT_STEPS="- [ ] Review note for accuracy, alternatives, and a clear recommendation, then merge"

bash "$REPO_DIR/infrastructure/agent-sandbox/run-pre-commit.sh"

git add docs/rnd
git commit -m "$COMMIT_SUBJECT" -m "$TRAILER"
git push -u origin "$BRANCH"

if [ -n "${GITHUB_ACTIONS:-}" ]; then
  HISTORY_SOURCE="GitHub Actions"
else
  HISTORY_SOURCE="Docker sandbox (local)"
fi

PR_BODY=$(CURRENT_BODY="$PR_FOOTER" PR_SUMMARY="$PR_SUMMARY" PR_NEXT_STEPS="$PR_NEXT_STEPS" PR_SUGGESTIONS="$PR_SUGGESTIONS" \
  HISTORY_SOURCE="$HISTORY_SOURCE" HISTORY_COMMAND="agentic-pr-create-rnd" HISTORY_PROMPT="$QUESTION" \
  HISTORY_SUMMARY="$COMMIT_SUBJECT" HISTORY_DATE="$(date -u +%Y-%m-%d)" \
  python3 "$REPO_DIR/infrastructure/agent-sandbox/merge-pr-body.py")

PR_URL=$(gh pr create --title "$PR_TITLE" --body "$PR_BODY")
echo "$PR_URL"
printf 'PR_URL::%s\n' "$PR_URL"
