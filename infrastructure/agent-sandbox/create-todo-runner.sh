#!/bin/bash
set -euo pipefail

DESCRIPTION=${1:?Usage: create-todo-runner.sh <DESCRIPTION>}
MODEL=${SOLVE_MODEL:-sonnet}
REPO_DIR="$HOME/vigilant-broccoli"
META_FILE=/tmp/create-meta.json
SLUG=$(echo "$DESCRIPTION" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | sed 's/^-*//;s/-*$//' | cut -c1-40)
BRANCH="agent/todo-create-${SLUG:-task}-$(date +%s)"
PR_FOOTER='🤖 Generated with [Claude Code](https://claude.com/claude-code)'
FALLBACK_TRAILER='Co-authored-by: Claude <noreply@anthropic.com>'

cd "$REPO_DIR"

git checkout -b "$BRANCH"
BASE_SHA=$(git rev-parse HEAD)
rm -f "$META_FILE"

PROMPT=$(cat <<EOF
You are running non-interactively in a fresh clone of vigilant-broccoli, on a dedicated branch. Create a well-researched task entry in the repo root TODO.md for the following:

$DESCRIPTION

Rules:
- Read TODO.md to learn its structure: section headings (## Features to Add, ## P1-P3) and entry format: ### <6-hex-id>. [category] Title, a short context paragraph, then a numbered Steps: list.
- Research before writing: grep the repo for every file, workflow, config, and doc the task touches. The entry must cite concrete paths (with line numbers where useful) and name an existing pattern to follow when one exists.
- Check CLAUDE.md and the docs it points to for conventions that constrain the task, and bake them into the steps.
- Generate a unique 6-hex id (python3 -c "import random; print(format(random.randint(0, 0xffffff), '06x'))") and verify it doesn't already appear in TODO.md.
- Add the entry under the most fitting existing section; only create a new section if none fits.
- Do not implement the task. Do not touch any file besides TODO.md.
- Do not run any git or gh commands and do not commit — branching, committing, pushing, and opening the PR are handled by the calling script.
- When finished, write $META_FILE containing only a JSON object with these string fields:
  - todo_id: the 6-hex id you generated
  - commit_message: capitalized, concise, focused on why the entry is needed, ending with a period
  - co_authored_by: the Co-Authored-By trailer line specified by your environment for the model authoring the commit
  - pr_title: the pull request title
  - pr_summary: markdown bullet points for the PR "## Summary" section
  - pr_test_plan: markdown checklist for the PR "## Test plan" section
EOF
)

claude -p "$PROMPT" --dangerously-skip-permissions --model "$MODEL" \
  --disallowedTools "Bash(git commit:*)" "Bash(git push:*)" "Bash(git checkout:*)" "Bash(git switch:*)" "Bash(gh:*)"

git checkout "$BRANCH"
[ "$(git rev-parse HEAD)" = "$BASE_SHA" ] || git reset --soft "$BASE_SHA"

if [ -z "$(git status --porcelain -- TODO.md)" ]; then
  echo "ERROR: TODO.md was not modified — no entry was added." >&2
  exit 1
fi
if [ -n "$(git status --porcelain -- ':(exclude)TODO.md')" ]; then
  echo "ERROR: changes outside TODO.md were made; only TODO.md should change." >&2
  git status --porcelain >&2
  exit 1
fi

read_meta() { jq -r "$1 // empty" "$META_FILE" 2>/dev/null || true; }

TODO_ID=$(read_meta .todo_id)
COMMIT_MESSAGE=$(read_meta .commit_message)
TRAILER=$(read_meta .co_authored_by)
PR_TITLE=$(read_meta .pr_title)
PR_SUMMARY=$(read_meta .pr_summary)
PR_TEST_PLAN=$(read_meta .pr_test_plan)

if [ -n "$COMMIT_MESSAGE" ]; then
  COMMIT_SUBJECT="docs: ${COMMIT_MESSAGE}"
else
  COMMIT_SUBJECT="docs: Add TODO entry for ${DESCRIPTION}."
fi

echo "$TRAILER" | grep -Eqi '^co-authored-by: .+ <.+>$' || TRAILER="$FALLBACK_TRAILER"
[ -n "$PR_TITLE" ] || PR_TITLE="$COMMIT_SUBJECT"
[ -n "$PR_SUMMARY" ] || PR_SUMMARY="- Add TODO entry${TODO_ID:+ ${TODO_ID}} for: ${DESCRIPTION}"
[ -n "$PR_TEST_PLAN" ] || PR_TEST_PLAN="- [ ] Entry reviewed for accuracy and actionable steps"

git add TODO.md
git commit -m "$COMMIT_SUBJECT" -m "$TRAILER"
git push -u origin "$BRANCH"

PR_BODY=$(cat <<EOF
## Summary

$PR_SUMMARY

## Test plan

$PR_TEST_PLAN

$PR_FOOTER
EOF
)

gh pr create --title "$PR_TITLE" --body "$PR_BODY"
