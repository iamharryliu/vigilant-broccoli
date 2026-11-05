#!/bin/bash
# Shared by solve-todo-runner.sh and update-pr-runner.sh (sourced, never run).
# Holds the single-PR publishing steps: TODO.md row cleanup, commit, push, PR
# creation and the draft-PR rescue of a failed create run. Git, pushes and PR
# creation stay here; the agent never runs them.
#
# The sourcing runner provides: META_FILE, PR_FOOTER, FALLBACK_TRAILER,
# PRE_COMMIT_HELPER, MERGE_BODY_HELPER, and, for pr_publish, PR_HISTORY_SOURCE
# and PR_HISTORY_COMMAND.

# shellcheck source=commit-subject.sh
. "$(dirname "${BASH_SOURCE[0]}")/commit-subject.sh"

SCREENSHOTS_HELPER=${SCREENSHOTS_HELPER:-$(dirname "${BASH_SOURCE[0]}")/pr-screenshots.py}

pr_one_line() { printf '%s' "$1" | tr '\n' ' ' | sed 's/  */ /g; s/^ //; s/ $//'; }

# PR_URL::/PR_TITLE:: open the record that write_pr_details (solve-todo.sh) and
# write-pr-step-summary.sh split the run log on. Diff body lines are always
# prefixed (' ', '+', '-', '\'), so a bare marker never appears inside the payload.
#   $1 state  $2 title  $3 url  $4 summary  $5 base sha
pr_emit_record() {
  local state=$1 title=$2 url=$3 summary=$4 base_sha=$5
  printf 'PR_TITLE::%s\n' "$(pr_one_line "$title")"
  printf 'PR_URL::%s\n' "$url"
  printf 'PR_STATE::%s\n' "$state"
  printf 'PR_FILES::%s\n' "$(pr_changed_files "$base_sha")"
  echo 'PR_SUMMARY_BEGIN'
  printf '%s\n' "$summary"
  echo 'PR_SUMMARY_END'
  echo 'PR_DIFF_BEGIN'
  git --no-pager diff --no-color --no-ext-diff "$base_sha" HEAD
  echo 'PR_DIFF_END'
}

# One-line JSON array of {file, summary} for the run summary's changed-files
# table. The file list comes from git; each summary is the agent's
# file_changes entry, blank when it gave none.
pr_changed_files() {
  local base_sha=$1
  git --no-pager diff --name-only "$base_sha" HEAD | jq -Rsc \
    --slurpfile meta <(jq -c '.file_changes // []' "$META_FILE" 2>/dev/null || echo '[]') \
    'split("\n") | map(select(length > 0)) | map(. as $f | {file: $f, summary: ((($meta[0] // []) | map(select(type == "object" and .file == $f)) | .[0].summary) // "")})'
}

pr_todo_ids_in() { grep -oE '^\|[[:space:]]*[0-9a-f]{6}[[:space:]]*\|' | grep -oE '[0-9a-f]{6}' | sort -u; }

# Validates the todo_ids the agent declared before anything is published.
# Prints every problem to stderr and returns 1 when one is unusable; absent or
# empty todo_ids are valid.
#   $1 metadata file  $2 git ref whose TODO.md rows may be resolved
#   $3 text a resolved id must appear in (the request)
pr_validate_todo_ids() {
  local meta=$1 todo_ref=$2 request=$3
  local problems="" ids rows id
  [ -f "$meta" ] || return 0
  jq -e . "$meta" >/dev/null 2>&1 || return 0

  jq -e '(.todo_ids // []) | (type == "array") and all(.[]; type == "string")' "$meta" >/dev/null 2>&1 \
    || problems="todo_ids must be an array of strings"

  ids=$(jq -r '(.todo_ids // [])[]? | strings' "$meta" 2>/dev/null || true)
  if [ -n "$ids" ]; then
    rows=$(git show "$todo_ref:TODO.md" 2>/dev/null | pr_todo_ids_in || true)
    for id in $(printf '%s\n' "$ids" | sort -u); do
      printf '%s' "$id" | grep -qE '^[0-9a-f]{6}$' || { problems+=$'\n'"\"$id\" is not a 6-hex TODO id"; continue; }
      printf '%s\n' "$rows" | grep -qx "$id" || problems+=$'\n'"TODO id $id has no row in TODO.md"
      printf '%s' "$request" | grep -qF "$id" || problems+=$'\n'"TODO id $id is not named in the request"
    done
  fi

  problems=$(printf '%s' "$problems" | sed '/^$/d')
  if [ -n "$problems" ]; then
    echo "ERROR: invalid todo_ids — nothing was published:" >&2
    printf '%s\n' "$problems" | sed 's/^/  - /' >&2
    return 1
  fi
}

# ids this run resolves: its declared todo_ids, or the single TODO id of a --id
# run when it declared none.
pr_current_todo_ids() {
  local meta=$1 default_id=${2:-} ids
  ids=$(jq -r '(.todo_ids // [])[]?' "$meta" 2>/dev/null || true)
  [ -n "$ids" ] || ids=$default_id
  printf '%s\n' "$ids" | sed '/^$/d' | sort -u
}

# Removes the rows of the ids this run fully resolves and refuses a run that
# deleted any other row, so a prompt cannot quietly drop unrelated work.
#   $1 base ref/sha the branch started from  $2... resolved ids
pr_apply_todo_cleanup() {
  local base=$1 id before after vanished tmp
  shift
  before=$(git show "$base:TODO.md" 2>/dev/null | pr_todo_ids_in || true)
  for id in "$@"; do
    printf '%s\n' "$before" | grep -qx "$id" || { echo "ERROR: no '${id}' row in TODO.md at this run's base." >&2; return 1; }
  done
  after=$(pr_todo_ids_in < TODO.md || true)
  vanished=$(comm -23 <(printf '%s\n' "$before" | sed '/^$/d') <(printf '%s\n' "$after" | sed '/^$/d'))
  for id in "$@"; do vanished=$(printf '%s\n' "$vanished" | grep -vx "$id" || true); done
  if [ -n "$(printf '%s' "$vanished" | sed '/^$/d')" ]; then
    echo "ERROR: TODO row(s) removed that this run did not declare as resolved: $(echo $vanished)" >&2
    return 1
  fi
  for id in "$@"; do
    tmp=$(mktemp)
    grep -vE "^\|[[:space:]]*${id}[[:space:]]*\|" TODO.md > "$tmp" || true
    mv "$tmp" TODO.md
  done
}

# Commits, pushes and opens the PR for the work in the checkout against main.
# Leaves the tree uncommitted on a pre-commit failure so the caller can salvage it.
#   $1 branch  $2 base sha  $3 history prompt  $4 fallback subject
#   $5 fallback summary
# Reads $META_FILE; prints the PR URL and its record on success.
pr_publish() {
  local branch=$1 base_sha=$2 history_prompt=$3 fallback_subject=$4 fallback_summary=$5
  local commit_type commit_scope commit_message trailer pr_title pr_summary pr_next_steps pr_concerns pr_suggestions subject
  commit_type=$(jq -r '.commit_type // empty' "$META_FILE" 2>/dev/null || true)
  commit_scope=$(jq -r '.commit_scope // empty' "$META_FILE" 2>/dev/null || true)
  commit_message=$(jq -r '.commit_message // empty' "$META_FILE" 2>/dev/null || true)
  trailer=$(jq -r '.co_authored_by // empty' "$META_FILE" 2>/dev/null || true)
  pr_title=$(jq -r '.pr_title // empty' "$META_FILE" 2>/dev/null || true)
  pr_summary=$(jq -r '.pr_summary // empty' "$META_FILE" 2>/dev/null || true)
  pr_next_steps=$(jq -r '.pr_next_steps // empty' "$META_FILE" 2>/dev/null || true)
  pr_concerns=$(jq -r '.pr_concerns // empty' "$META_FILE" 2>/dev/null || true)
  pr_suggestions=$(jq -r '.pr_suggestions // empty' "$META_FILE" 2>/dev/null || true)

  subject=$(commit_header "$commit_type" "$commit_scope" "$commit_message")
  [ -n "$subject" ] || subject=$fallback_subject
  echo "$trailer" | grep -Eqi '^co-authored-by: .+ <.+>$' || trailer=$FALLBACK_TRAILER
  pr_title=$(normalize_pr_title "$pr_title")
  [ -n "$pr_title" ] || pr_title=$subject
  [ -n "$pr_summary" ] || pr_summary=$fallback_summary
  [ -n "$pr_next_steps" ] || pr_next_steps='- [ ] Merge once CI is green'

  python3 "$SCREENSHOTS_HELPER" --metadata "$META_FILE" --prepare || return 1
  bash "$PRE_COMMIT_HELPER" || return 1
  git add -A || return 1
  SKIP=$SKIP_COMMIT_HOOKS git commit -m "$subject" -m "$trailer" || return 1
  git push -u origin "$branch" || return 1

  local body url screenshots
  screenshots=$(python3 "$SCREENSHOTS_HELPER" --metadata "$META_FILE") || return 1
  body=$(CURRENT_BODY="$PR_FOOTER" PR_SUMMARY="$pr_summary" PR_NEXT_STEPS="$pr_next_steps" PR_CONCERNS="$pr_concerns" PR_SUGGESTIONS="$pr_suggestions" PR_SCREENSHOTS="$screenshots" \
    HISTORY_SOURCE="$PR_HISTORY_SOURCE" HISTORY_COMMAND="$PR_HISTORY_COMMAND" HISTORY_PROMPT="$history_prompt" \
    HISTORY_SUMMARY="$subject" HISTORY_DATE="$(date -u +%Y-%m-%d)" \
    python3 "$MERGE_BODY_HELPER") || return 1
  url=$(gh pr create --base main --head "$branch" --title "$pr_title" --body "$body") || return 1
  echo "$url"
  pr_emit_record created "$pr_title" "$url" "$pr_summary" "$base_sha"
}

# Best-effort rescue of an unfinished run as a draft PR. Never fails; says what
# happened through a RESULT:: marker.
#   $1 branch  $2 base sha  $3 title  $4 request body  $5 exit code
pr_salvage() {
  local branch=$1 base_sha=$2 title=$3 request_body=$4 exit_code=$5
  local pr_url body
  if ! git checkout "$branch" >/dev/null 2>&1; then
    echo "Failed to check out salvage branch $branch." >&2
    printf 'RESULT::salvage-checkout-failed\n'
    return 0
  fi
  # Unfinished work cannot resolve a TODO, including cleanup committed before a
  # publication failure. Keep those rows on the recovery branch.
  if git cat-file -e "$base_sha:TODO.md" 2>/dev/null; then
    if ! git restore --source="$base_sha" --staged --worktree -- TODO.md; then
      printf 'RESULT::salvage-todo-restore-failed\n'
      return 0
    fi
  fi
  if [ -z "$(git status --porcelain)" ] && [ "$(git rev-parse HEAD)" = "$base_sha" ]; then
    echo "No work to salvage on $branch." >&2
    printf 'RESULT::salvage-nothing\n'
    return 0
  fi
  if [ -n "$(git status --porcelain)" ]; then
    if ! git add -A || ! SKIP=$SKIP_COMMIT_HOOKS git commit -m "chore: Save partial progress from an incomplete agent run." -m "$FALLBACK_TRAILER"; then
      echo "Failed to commit salvage work on $branch; hooks were not bypassed." >&2
      printf 'RESULT::salvage-commit-failed\n'
      return 0
    fi
  fi
  if ! git push -u origin "$branch"; then
    echo "Failed to push salvage branch $branch — partial work could not be recovered." >&2
    printf 'RESULT::salvage-push-failed\n'
    return 0
  fi
  body=$(cat <<BODY
## Summary

This agent run did not finish (exited with status ${exit_code}). This draft PR captures its partial work so it isn't lost.

## Request

$request_body

To continue, run: \`pnpm agentic-pr-update <PR#> "finish the task"\`

$PR_FOOTER
BODY
)
  # The PR title is linted by commitlint, so it must be a conventional commit
  # header ending in a full stop; the raw task text is not.
  title=$(normalize_pr_title "chore: Save partial progress from an incomplete agent run: $(pr_one_line "$title" | cut -c1-60)")
  if pr_url=$(gh pr create --draft --base main --head "$branch" --title "$title" --body "$body" 2>&1); then
    echo "Salvaged partial work: $pr_url" >&2
    echo "$pr_url"
    printf 'RESULT::salvaged\n'
    pr_emit_record salvaged "$title" "$pr_url" \
      "This agent run did not finish (exited with status ${exit_code}); partial work was pushed as a draft PR." "$base_sha"
  else
    echo "Pushed salvage branch $branch but failed to open a PR — open one manually." >&2
    printf 'RESULT::salvage-pr-failed\n'
  fi
}
