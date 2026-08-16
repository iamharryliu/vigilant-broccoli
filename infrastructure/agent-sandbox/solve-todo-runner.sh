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
  # TODO items live as rows in per-section markdown tables (ID | Priority |
  # Description | Recommended Fix). Extract the nearest table header plus the
  # matching row, expanding <br> step separators and unescaping \| pipes so the
  # solver reads clean prose.
  TASK=$(awk -v id="$ID" '
    /^\|[[:space:]]*ID[[:space:]]*\|[[:space:]]*Priority[[:space:]]*\|/ { header=$0 }
    $0 ~ ("^\\|[[:space:]]*" id "[[:space:]]*\\|") { print header; print; found=1; exit }
    END { if (!found) exit 1 }
  ' TODO.md | sed 's/<br>/\n/g; s/\\|/|/g')
  if [ -z "$TASK" ]; then
    echo "ERROR: no '${ID}' row in TODO.md" >&2
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

if [ -n "${GITHUB_ACTIONS:-}" ]; then
  REQUEST_SOURCE="GitHub Actions (manual-agentic-solve workflow)"
else
  REQUEST_SOURCE="Local CLI (pnpm agentic:task:solve)"
fi
if [ "$MODE" = id ]; then
  REQUEST_TRIGGER="TODO id \`${ID}\`"
else
  REQUEST_TRIGGER='--prompt'
fi
REQUEST_BODY=$(cat <<REQ
- **Source:** ${REQUEST_SOURCE}
- **Trigger:** ${REQUEST_TRIGGER}

${TASK}
REQ
)

git checkout -b "$BRANCH"
BASE_SHA=$(git rev-parse HEAD)
rm -f "$META_FILE"

salvage_on_failure() {
  local exit_code=$?
  trap - EXIT
  set +e
  [ "$exit_code" -eq 0 ] && exit 0

  echo "Runner exited with status $exit_code — checking for salvageable work on $BRANCH" >&2
  git checkout "$BRANCH" >/dev/null 2>&1

  if [ -z "$(git status --porcelain)" ]; then
    echo "No uncommitted changes to salvage." >&2
    exit "$exit_code"
  fi

  if [ "$MODE" = id ]; then
    SALVAGE_TITLE="[WIP] Resolve TODO ${ID} (agent run incomplete)"
  else
    SALVAGE_TITLE="[WIP] $(printf '%s' "$TASK" | tr '\n' ' ' | cut -c1-80) (agent run incomplete)"
  fi

  git add -A
  # --no-verify: a WIP salvage commit must not be blocked by lint/format hooks —
  # the goal is to preserve an unfinished diff, not to ship clean code.
  git commit --no-verify -m "wip: Save partial progress from an incomplete agent run." -m "$FALLBACK_TRAILER"

  if ! git push -u origin "$BRANCH"; then
    echo "Failed to push salvage branch $BRANCH — partial work could not be recovered." >&2
    exit "$exit_code"
  fi

  SALVAGE_BODY=$(cat <<BODY
## Summary

This agent run did not finish (exited with status ${exit_code}). This draft PR captures its partial, uncommitted work so it isn't lost.

## Request

$REQUEST_BODY

To continue, run: \`pnpm agentic:pr:update <PR#> "finish the task"\`

$PR_FOOTER
BODY
)

  if PR_URL=$(gh pr create --draft --title "$SALVAGE_TITLE" --body "$SALVAGE_BODY" 2>&1); then
    echo "Salvaged partial work: $PR_URL" >&2
  else
    echo "Pushed salvage branch $BRANCH but failed to open a PR — open one manually." >&2
  fi

  exit "$exit_code"
}
trap salvage_on_failure EXIT

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
  # Each TODO item is a single table row whose first column is its id; drop that
  # row. The anchored regex only matches the id in the leading cell, so passing
  # mentions of the id inside another row's prose (cross-references) are kept.
  grep -vE "^\|[[:space:]]*${ID}[[:space:]]*\|" TODO.md > "$TMP"
  mv "$TMP" TODO.md
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

bash "$REPO_DIR/infrastructure/agent-sandbox/run-pre-commit.sh"

git add -A
git commit -m "$COMMIT_SUBJECT" -m "$TRAILER"
git push -u origin "$BRANCH"

PR_BODY=$(cat <<EOF
## Summary

$PR_SUMMARY

## Test plan

$PR_TEST_PLAN

## Request

$REQUEST_BODY

$PR_FOOTER
EOF
)

gh pr create --title "$PR_TITLE" --body "$PR_BODY"
