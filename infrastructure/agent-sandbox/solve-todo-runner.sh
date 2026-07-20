#!/bin/bash
set -euo pipefail

MODE=""
ID=""
TASK=""
while [ $# -gt 0 ]; do
  case "$1" in
    --id)
      MODE=id
      ID=$2
      shift 2
      ;;
    --prompt)
      MODE=prompt
      TASK=$2
      shift 2
      ;;
    *)
      echo "Usage: solve-todo-runner.sh (--id <TODO_ID> | --prompt <text>)" >&2
      exit 1
      ;;
  esac
done

MODEL=${SOLVE_MODEL:-sonnet}
REPO_DIR="$HOME/vigilant-broccoli"
META_FILE=/tmp/solve-meta.json
PR_FOOTER='🤖 Generated with [Claude Code](https://claude.com/claude-code)'
FALLBACK_TRAILER='Co-authored-by: Claude <noreply@anthropic.com>'

cd "$REPO_DIR"

if [ "$MODE" = id ]; then
  TASK=$(awk -v id="$ID" '/^### /||/^## /{p=($0 ~ "^### " id "\\.")} p' TODO.md)
  if [ -z "$TASK" ]; then
    echo "ERROR: no '### ${ID}.' item in TODO.md" >&2
    exit 1
  fi
  BRANCH="agent/todo-${ID}"
  INTRO="Resolve this TODO item (already extracted from the repo root TODO.md):"
  SCOPE_RULE="- Do not run any git or gh commands and do not edit TODO.md — branching, TODO.md cleanup, committing, pushing, and opening the PR are all handled by the calling script."
elif [ "$MODE" = prompt ]; then
  SLUG=$(echo "$TASK" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | sed 's/^-*//;s/-*$//' | cut -c1-40)
  BRANCH="agent/task-${SLUG:-task}-$(date +%s)"
  INTRO="Accomplish this task:"
  SCOPE_RULE="- Do not run any git or gh commands — branching, committing, pushing, and opening the PR are all handled by the calling script."
else
  echo "Usage: solve-todo-runner.sh (--id <TODO_ID> | --prompt <text>)" >&2
  exit 1
fi

git checkout -b "$BRANCH"
BASE_SHA=$(git rev-parse HEAD)
rm -f "$META_FILE"

PROMPT=$(cat <<EOF
You are running non-interactively in a fresh clone of vigilant-broccoli, on a dedicated branch. $INTRO

$TASK

Rules:
- Make only the changes needed, following the repo conventions in CLAUDE.md.
$SCOPE_RULE
- When finished, write $META_FILE containing only a JSON object with these string fields:
  - commit_type: one of feat, fix, ci, chore, docs, refactor, enhancement, security, infrastructure
  - commit_scope: the affected app/service/lib name, or "" when the change is not scoped to one
  - commit_message: capitalized, concise, focused on why not what, ending with a period
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

if [ "$MODE" = id ]; then
  if [ -z "$(git status --porcelain -- ':(exclude)TODO.md')" ]; then
    echo "ERROR: no changes besides TODO.md — TODO ${ID} was not resolved." >&2
    exit 1
  fi
  TMP=$(mktemp)
  awk -v id="$ID" '/^### /||/^## /{skip=($0 ~ "^### " id "\\.")} !skip' TODO.md > "$TMP"
  awk '
    function flush() { if (heading == "" || has_item) { if (heading != "") print heading; printf "%s", buf } }
    /^## / { flush(); heading = $0; buf = ""; has_item = 0; next }
    { buf = buf $0 "\n"; if (/^### /) has_item = 1 }
    END { flush() }
  ' "$TMP" > TODO.md
  rm -f "$TMP"
else
  if [ -z "$(git status --porcelain)" ]; then
    echo "ERROR: no changes produced — task was not completed." >&2
    exit 1
  fi
fi

read_meta() { jq -r "$1 // empty" "$META_FILE" 2>/dev/null || true; }

COMMIT_TYPE=$(read_meta .commit_type)
COMMIT_SCOPE=$(read_meta .commit_scope)
COMMIT_MESSAGE=$(read_meta .commit_message)
TRAILER=$(read_meta .co_authored_by)
PR_TITLE=$(read_meta .pr_title)
PR_SUMMARY=$(read_meta .pr_summary)
PR_TEST_PLAN=$(read_meta .pr_test_plan)

case "$COMMIT_TYPE" in
  feat | fix | ci | chore | docs | refactor | enhancement | security | infrastructure) ;;
  *) COMMIT_TYPE="" ;;
esac

if [ "$MODE" = id ]; then
  FALLBACK_SUBJECT="chore: Resolve TODO ${ID}."
  FALLBACK_SUMMARY="- Resolve TODO ${ID}."
else
  FALLBACK_SUBJECT="chore: Complete agent task."
  FALLBACK_SUMMARY="- ${TASK}"
fi

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
[ -n "$PR_TITLE" ] || PR_TITLE="$COMMIT_SUBJECT"
[ -n "$PR_SUMMARY" ] || PR_SUMMARY="$FALLBACK_SUMMARY"
[ -n "$PR_TEST_PLAN" ] || PR_TEST_PLAN="- [ ] CI passes"

git add -A
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
