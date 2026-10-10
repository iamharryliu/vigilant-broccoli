#!/bin/bash
# Shared by solve-todo-runner.sh and update-pr-runner.sh (sourced, never run) to
# publish one request as several pull requests. The first agent run implements
# the first increment and may describe the rest in an "increments" array in its
# metadata file; the runner validates that plan before publishing anything, then
# runs a fresh agent per later increment on its own branch, so a file can change
# in several increments. Independent increments branch from origin/main;
# a dependent one branches from its prerequisite and its PR targets that branch,
# so its diff is only its own increment. Git, pushes and PR creation stay here;
# the agent never runs them.
#
# The sourcing runner provides: REPO_DIR, META_FILE, PR_FOOTER, FALLBACK_TRAILER,
# PRE_COMMIT_HELPER, MERGE_BODY_HELPER, INC_SKILL_INSTRUCTIONS, INC_REQUEST,
# INC_HISTORY_SOURCE, INC_HISTORY_COMMAND, INC_HISTORY_BASE_COMMAND, and agent_invoke "<prompt>".

INC_MAX_LATER=4
INC_SKIP_COMMIT_HOOKS=lint-staged
INC_DEFAULT_BASE=${INC_DEFAULT_BASE:-main}
INC_CURRENT=current
INC_PLAN_FILE=/tmp/increment-plan.json
INC_COMMIT_TYPES='feat fix ci chore docs refactor enhancement security infrastructure'

declare -A INC_BRANCH=() INC_URL=() INC_TITLE=() INC_DEP=() INC_TASK=() INC_STATE=() INC_REASON=()
INC_ORDER=()

inc_one_line() { printf '%s' "$1" | tr '\n' ' ' | sed 's/  */ /g; s/^ //; s/ $//'; }

inc_pr_ref() { printf '#%s' "${1##*/}"; }

# PR_URL::/PR_TITLE:: open a record that write_pr_details (solve-todo.sh) and
# write-pr-step-summary.sh split the run log on; the diff is against the
# increment's own base, so a stacked PR reports only what it adds. Diff body
# lines are always prefixed (' ', '+', '-', '\'), so a bare marker never
# appears inside the payload.
inc_emit_record() {
  local state=$1 title=$2 url=$3 pr_base=$4 depends_url=$5 summary=$6 base_sha=$7
  printf 'PR_TITLE::%s\n' "$(inc_one_line "$title")"
  printf 'PR_URL::%s\n' "$url"
  printf 'PR_STATE::%s\n' "$state"
  printf 'PR_BASE::%s\n' "$pr_base"
  printf 'PR_DEPENDS_ON::%s\n' "$depends_url"
  echo 'PR_SUMMARY_BEGIN'
  printf '%s\n' "$summary"
  echo 'PR_SUMMARY_END'
  echo 'PR_DIFF_BEGIN'
  git --no-pager diff --no-color --no-ext-diff "$base_sha" HEAD
  echo 'PR_DIFF_END'
}

inc_emit_unpublished() {
  local id=$1 reason=$2
  printf 'INCREMENT_UNPUBLISHED::%s\n' "$(jq -nc \
    --arg id "$id" --arg title "${INC_TITLE[$id]:-$id}" --arg task "${INC_TASK[$id]:-}" --arg reason "$reason" \
    '{id: $id, title: $title, task: $task, reason: $reason}')"
}

inc_todo_ids_in() { grep -oE '^\|[[:space:]]*[0-9a-f]{6}[[:space:]]*\|' | grep -oE '[0-9a-f]{6}' | sort -u; }

# Validates .increments of the first run's metadata before anything is
# published. Prints every problem to stderr and returns 1 when the plan is
# unusable; an absent or empty plan is valid (a single PR).
#   $1 metadata file  $2 git ref whose TODO.md rows may be resolved
#   $3 text a resolved id must appear in (the request)  $4 id that must be
#   assigned when a plan exists (id mode), or ""
inc_validate_plan() {
  local meta=$1 todo_ref=$2 request=$3 required_id=${4:-}
  local problems
  [ -f "$meta" ] || return 0
  jq -e . "$meta" >/dev/null 2>&1 || return 0

  problems=$(jq -r --argjson max "$INC_MAX_LATER" --arg current "$INC_CURRENT" '
    def blank: (type != "string") or (gsub("\\s"; "") == "");
    def ids_ok: (. // []) | (type == "array") and all(.[]; type == "string");
    ((.todo_ids | ids_ok) | not) as $badTop
    | (.increments // []) as $p
    | if ($p | type) != "array" then "increments must be an array"
      else
        (if ($p | length) > $max then "at most \($max) later increments are allowed, got \($p | length)" else empty end),
        (if $badTop then "todo_ids must be an array of strings" else empty end),
        ($p | to_entries[] | .key as $i | .value as $v
          | if ($v | type) != "object" then "increment #\($i + 1) is not an object"
            else
              (if (($v.id | type) != "string") or (($v.id | test("^[a-z0-9][a-z0-9-]{0,23}$")) | not) or $v.id == $current
                then "increment #\($i + 1) needs a kebab-case id other than \"\($current)\"" else empty end),
              (if ($v.title | blank) then "increment #\($i + 1) needs a title" else empty end),
              (if ($v.task | blank) then "increment #\($i + 1) needs a task" else empty end),
              (($v.depends_on // "") as $d
                | if ($d | type) != "string" then "increment #\($i + 1): depends_on must be one id string"
                  elif $d == "" or $d == $current then empty
                  elif ([$p[:$i][] | .id?] | index($d)) then empty
                  else "increment #\($i + 1): depends_on \"\($d)\" must be \"\($current)\" or an earlier increment" end),
              (if ($v.todo_ids | ids_ok) then empty else "increment #\($i + 1): todo_ids must be an array of strings" end)
            end),
        ([$p[] | .id?] | group_by(.) | map(select(length > 1) | .[0])[] | "duplicate increment id \"\(.)\"")
      end' "$meta" 2>&1) || problems="metadata plan could not be evaluated: $problems"

  local assigned dup id
  assigned=$(jq -r '[(.todo_ids // [])[]?, ((.increments // [])[]? | (.todo_ids // [])[]?)] | .[]' "$meta" 2>/dev/null || true)
  if [ -n "$assigned" ]; then
    dup=$(printf '%s\n' "$assigned" | sort | uniq -d)
    [ -z "$dup" ] || problems+=$'\n'"TODO id(s) assigned to more than one increment: $(echo $dup)"
    local rows
    rows=$(git show "$todo_ref:TODO.md" 2>/dev/null | inc_todo_ids_in || true)
    for id in $(printf '%s\n' "$assigned" | sort -u); do
      printf '%s' "$id" | grep -qE '^[0-9a-f]{6}$' || { problems+=$'\n'"\"$id\" is not a 6-hex TODO id"; continue; }
      printf '%s\n' "$rows" | grep -qx "$id" || problems+=$'\n'"TODO id $id has no row in TODO.md"
      printf '%s' "$request" | grep -qF "$id" || problems+=$'\n'"TODO id $id is not named in the request"
    done
  fi
  if [ -n "$required_id" ] && [ "$(jq '(.increments // []) | length' "$meta" 2>/dev/null || echo 0)" -gt 0 ]; then
    printf '%s\n' "$assigned" | grep -qx "$required_id" \
      || problems+=$'\n'"TODO id $required_id must be assigned to the increment that fully resolves it"
  fi

  problems=$(printf '%s' "$problems" | sed '/^$/d')
  if [ -n "$problems" ]; then
    echo "ERROR: invalid increment plan — no increment was published (work already done is saved as a draft pull request when possible):" >&2
    printf '%s\n' "$problems" | sed 's/^/  - /' >&2
    return 1
  fi
}

# ids this increment resolves: its declared todo_ids, or the single TODO id of a
# --id run when it declared none.
inc_current_todo_ids() {
  local meta=$1 default_id=${2:-} ids
  ids=$(jq -r '(.todo_ids // [])[]?' "$meta" 2>/dev/null || true)
  if [ -z "$ids" ] && [ -n "$default_id" ] \
    && [ "$(jq '(.increments // []) | length' "$meta" 2>/dev/null || echo 0)" -eq 0 ]; then
    ids=$default_id
  fi
  printf '%s\n' "$ids" | sed '/^$/d' | sort -u
}

# Removes the rows of the ids this increment fully resolves and refuses a run
# that deleted any other row, so a prompt cannot quietly drop unrelated work.
#   $1 base ref/sha the branch started from  $2... resolved ids
inc_apply_todo_cleanup() {
  local base=$1 id before after vanished tmp
  shift
  before=$(git show "$base:TODO.md" 2>/dev/null | inc_todo_ids_in || true)
  for id in "$@"; do
    printf '%s\n' "$before" | grep -qx "$id" || { echo "ERROR: no '${id}' row in TODO.md at this increment's base." >&2; return 1; }
  done
  after=$(inc_todo_ids_in < TODO.md || true)
  vanished=$(comm -23 <(printf '%s\n' "$before" | sed '/^$/d') <(printf '%s\n' "$after" | sed '/^$/d'))
  for id in "$@"; do vanished=$(printf '%s\n' "$vanished" | grep -vx "$id" || true); done
  if [ -n "$(printf '%s' "$vanished" | sed '/^$/d')" ]; then
    echo "ERROR: TODO row(s) removed that this increment did not declare as resolved: $(echo $vanished)" >&2
    return 1
  fi
  for id in "$@"; do
    tmp=$(mktemp)
    grep -vE "^\|[[:space:]]*${id}[[:space:]]*\|" TODO.md > "$tmp" || true
    mv "$tmp" TODO.md
  done
}

# Instructions appended to the first agent run's prompt.
#   $1 solve | update
inc_plan_instructions() {
  cat <<'EOF'
Increments:
- Keep a simple task as one change and write no "increments" field. Split only when the request bundles independent changes or is too large to review as one diff, per the pull request scope guidance in the shared instructions.
- When splitting, implement only the first increment in this checkout. Describe every other increment in an "increments" array in the metadata file, at most 4, each an object with:
  - id: short unique kebab-case id, never "current"
  - title: the increment's pull request title
  - task: a self-contained prompt for a fresh agent that sees only the original request and this plan — name the files, interfaces and conventions the earlier increments introduce
  - depends_on: "" when it works on main alone, "current" when it needs the increment you are implementing now, or the id of one earlier-listed increment it needs. A single prerequisite only; a dependent increment is checked out on top of that prerequisite and its pull request targets its branch.
  - todo_ids: the 6-hex TODO.md ids named in the request that this increment fully resolves, or []
- List prerequisites before the increments that depend on them. Several increments may change the same file; split by outcome, not by file path.
- Every increment must build and pass its checks on top of only its declared prerequisite.
- Set the top-level "todo_ids" field to the TODO.md ids named in the request that the increment you implement fully resolves. Do not edit TODO.md: the runner removes exactly the rows declared as fully resolved, and any other row stays. An id with no row is reported, not guessed.
- The runner validates the whole plan before publishing anything and fails the run on an invalid one.
EOF
  if [ "$1" = update ]; then
    echo '- Keep this pull request to its existing purpose. Work that is independent of it, or that builds on it, belongs in a later increment (depends_on "current" for work that needs this pull request) rather than in more diff here.'
  fi
}

inc_later_prompt() {
  local id=$1 dep=$2 plan_overview prereq
  plan_overview=$(jq -r --arg current "$INC_CURRENT" --arg ctitle "${INC_TITLE[$INC_CURRENT]}" '
    "- \($current): \($ctitle)" ,
    ((.[]) | "- \(.id)\(if (.depends_on // "") != "" then " (builds on \(.depends_on))" else " (independent)" end): \(.title)")' "$INC_PLAN_FILE")
  if [ -n "$dep" ]; then
    prereq="Its prerequisite, increment \"$dep\", is already committed in this checkout; build on it."
  else
    prereq='This increment is independent: the checkout is main without the other increments, so do not rely on their changes.'
  fi
  cat <<EOF
You are running non-interactively in a fresh clone of vigilant-broccoli, on a dedicated branch. A larger request is being published as several pull requests; you are implementing one increment of it. The plan is fixed — do not re-plan or split it further.

Original request:

$INC_REQUEST

Planned increments:
$plan_overview

Your increment is "$id": ${INC_TITLE[$id]}

${INC_TASK[$id]}

$prereq

Follow these shared task instructions:

$INC_SKILL_INSTRUCTIONS

Sandbox execution rules:
- You are already inside the unattended sandbox mentioned in the skill; complete the task here without launching another sandbox.
- Do not run any git or gh commands and do not edit TODO.md — branching, TODO.md cleanup, committing, pushing, and opening the PR are all handled by the calling script.
- Implement only this increment and make it work with its declared prerequisite alone.
- When finished, write $META_FILE containing only a JSON object with these string fields:
  - commit_type: one of ${INC_COMMIT_TYPES// /, }
  - commit_scope: the affected app/service/lib name, or "" when the change is not scoped to one
  - commit_message: capitalized, concise, focused on why not what, ending with a period
  - co_authored_by: the Co-Authored-By trailer line specified by your environment for the model authoring the commit, or "$FALLBACK_TRAILER" when no such trailer is specified
  - pr_title: the pull request title
  - pr_summary: markdown bullet points for the PR "## Summary" section, describing only this increment
  - pr_next_steps: markdown checklist for the PR "## Next steps" section — remaining actions for the human for this increment, or "- [ ] Merge once CI is green" when nothing else is left
  - pr_suggestions: markdown bullet points for the PR "## Suggestions" section, or "" when there are none
EOF
}

# "## Stack" body for one PR: every increment in merge order, with the
# prerequisite each is stacked on.
inc_stack_markdown() {
  local self=$1 id n=0 dep line
  echo 'This pull request is one of several published from one request. Merge them in this order; a stacked pull request targets its prerequisite'"'"'s branch, so its diff shows only its own increment. After a squash merge, advance dependents as described in docs/git-workflow.md under "Stacked pull requests".'
  echo
  for id in "${INC_ORDER[@]}"; do
    n=$((n + 1))
    dep=${INC_DEP[$id]:-}
    if [ -n "${INC_URL[$id]:-}" ]; then
      line="$n. [$(inc_pr_ref "${INC_URL[$id]}")](${INC_URL[$id]}) ${INC_TITLE[$id]}"
      [ "${INC_STATE[$id]:-}" != salvaged ] || line+=" — draft with partial work, do not merge"
    else
      line="$n. ${INC_TITLE[$id]} — not published (${INC_REASON[$id]:-not yet published})"
    fi
    if [ -n "$dep" ] && [ -n "${INC_URL[$dep]:-}" ]; then
      line+=" — merge after $(inc_pr_ref "${INC_URL[$dep]}"), base \`${INC_BRANCH[$dep]}\`"
    elif [ -n "$dep" ]; then
      line+=" — merge after ${INC_TITLE[$dep]}"
    else
      line+=" — no prerequisite"
    fi
    [ "$id" != "$self" ] || line+=" **(this pull request)**"
    echo "$line"
  done
}

# Rewrites the "## Stack" section of every published PR once the set is known.
inc_refresh_stacks() {
  local id body new_body published=0 failed=0
  for id in "${INC_ORDER[@]}"; do [ -z "${INC_URL[$id]:-}" ] || published=$((published + 1)); done
  [ "$published" -gt 1 ] || return 0
  for id in "${INC_ORDER[@]}"; do
    [ -n "${INC_URL[$id]:-}" ] || continue
    if body=$(gh pr view "${INC_URL[$id]}" --json body -q .body) \
      && new_body=$(CURRENT_BODY="$body" PR_STACK="$(inc_stack_markdown "$id")" python3 "$MERGE_BODY_HELPER") \
      && gh pr edit "${INC_URL[$id]}" --body "$new_body" >/dev/null; then
      :
    else
      failed=1
      echo "WARNING: could not add the stack section to ${INC_URL[$id]}." >&2
      printf 'STACK_UPDATE_FAILED::%s\n' "${INC_URL[$id]}"
    fi
  done
  return "$failed"
}

# Commits, pushes and opens the PR for the increment in the checkout. Leaves
# the tree uncommitted on a pre-commit failure so the caller can salvage it.
#   $1 id  $2 branch  $3 pr base branch  $4 base sha  $5 history prompt
#   $6 fallback subject  $7 fallback summary
# Reads $META_FILE; prints this increment's record on success.
inc_publish() {
  local id=$1 branch=$2 pr_base=$3 base_sha=$4 history_prompt=$5 fallback_subject=$6 fallback_summary=$7
  local commit_type commit_scope commit_message trailer pr_title pr_summary pr_next_steps pr_suggestions subject
  commit_type=$(jq -r '.commit_type // empty' "$META_FILE" 2>/dev/null || true)
  commit_scope=$(jq -r '.commit_scope // empty' "$META_FILE" 2>/dev/null || true)
  commit_message=$(jq -r '.commit_message // empty' "$META_FILE" 2>/dev/null || true)
  trailer=$(jq -r '.co_authored_by // empty' "$META_FILE" 2>/dev/null || true)
  pr_title=$(jq -r '.pr_title // empty' "$META_FILE" 2>/dev/null || true)
  pr_summary=$(jq -r '.pr_summary // empty' "$META_FILE" 2>/dev/null || true)
  pr_next_steps=$(jq -r '.pr_next_steps // empty' "$META_FILE" 2>/dev/null || true)
  pr_suggestions=$(jq -r '.pr_suggestions // empty' "$META_FILE" 2>/dev/null || true)

  case " $INC_COMMIT_TYPES " in *" $commit_type "*) ;; *) commit_type="" ;; esac
  if [ -n "$commit_type" ] && [ -n "$commit_message" ]; then
    commit_message=${commit_message^}
    commit_message="${commit_message%.}."
    if [ -n "$commit_scope" ]; then subject="${commit_type}(${commit_scope}): ${commit_message}"; else subject="${commit_type}: ${commit_message}"; fi
  else
    subject=$fallback_subject
  fi
  echo "$trailer" | grep -Eqi '^co-authored-by: .+ <.+>$' || trailer=$FALLBACK_TRAILER
  [ -n "$pr_title" ] || pr_title=$subject
  [ -n "$pr_summary" ] || pr_summary=$fallback_summary
  [ -n "$pr_next_steps" ] || pr_next_steps='- [ ] Merge once CI is green'

  bash "$PRE_COMMIT_HELPER" || return 1
  git add -A || return 1
  SKIP=$INC_SKIP_COMMIT_HOOKS git commit -m "$subject" -m "$trailer" || return 1
  git push -u origin "$branch" || return 1

  INC_BRANCH[$id]=$branch
  INC_TITLE[$id]=$pr_title
  local stack="" body url
  if [ "${#INC_ORDER[@]}" -gt 1 ]; then stack=$(inc_stack_markdown "$id"); fi
  body=$(CURRENT_BODY="$PR_FOOTER" PR_SUMMARY="$pr_summary" PR_NEXT_STEPS="$pr_next_steps" PR_SUGGESTIONS="$pr_suggestions" PR_STACK="$stack" \
    HISTORY_SOURCE="$INC_HISTORY_SOURCE" HISTORY_COMMAND="$INC_HISTORY_COMMAND" HISTORY_PROMPT="$history_prompt" \
    HISTORY_SUMMARY="$subject" HISTORY_DATE="$(date -u +%Y-%m-%d)" \
    python3 "$MERGE_BODY_HELPER") || return 1
  url=$(gh pr create --base "$pr_base" --head "$branch" --title "$pr_title" --body "$body") || return 1
  INC_URL[$id]=$url
  INC_STATE[$id]=created
  echo "$url"
  local dep=${INC_DEP[$id]:-}
  inc_emit_record created "$pr_title" "$url" "$pr_base" "${dep:+${INC_URL[$dep]:-}}" "$pr_summary" "$base_sha"
}

# Best-effort rescue of an unfinished increment as a draft PR. Never fails; says
# what happened through a RESULT:: marker.
#   $1 branch  $2 pr base  $3 base sha  $4 title  $5 request body  $6 exit code
#   $7 id
inc_salvage() {
  local branch=$1 pr_base=$2 base_sha=$3 title=$4 request_body=$5 exit_code=$6 id=${7:-$INC_CURRENT}
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
    if ! git add -A || ! SKIP=$INC_SKIP_COMMIT_HOOKS git commit -m "chore: Save partial progress from an incomplete agent run." -m "$FALLBACK_TRAILER"; then
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
  title="[WIP] $(inc_one_line "$title" | cut -c1-80) (agent run incomplete)"
  if pr_url=$(gh pr create --draft --base "$pr_base" --head "$branch" --title "$title" --body "$body" 2>&1); then
    echo "Salvaged partial work: $pr_url" >&2
    echo "$pr_url"
    INC_URL[$id]=$pr_url
    INC_BRANCH[$id]=$branch
    INC_STATE[$id]=salvaged
    printf 'RESULT::salvaged\n'
    inc_emit_record salvaged "$title" "$pr_url" "$pr_base" "" \
      "This agent run did not finish (exited with status ${exit_code}); partial work was pushed as a draft PR." "$base_sha"
  else
    echo "Pushed salvage branch $branch but failed to open a PR — open one manually." >&2
    printf 'RESULT::salvage-pr-failed\n'
  fi
}

# Registers the planned increments (after the current one) from $INC_PLAN_FILE.
inc_load_plan() {
  local meta=$1 i n id
  jq -c '(.increments // [])' "$meta" > "$INC_PLAN_FILE"
  n=$(jq 'length' "$INC_PLAN_FILE")
  for ((i = 0; i < n; i++)); do
    id=$(jq -r ".[$i].id" "$INC_PLAN_FILE")
    INC_ORDER+=("$id")
    INC_TITLE[$id]=$(jq -r ".[$i].title" "$INC_PLAN_FILE")
    INC_TASK[$id]=$(jq -r ".[$i].task" "$INC_PLAN_FILE")
    INC_DEP[$id]=$(jq -r ".[$i].depends_on // \"\"" "$INC_PLAN_FILE")
    INC_STATE[$id]=pending
  done
}

# Publishes every later increment in plan order, stopping at the first failure.
# Returns 1 on failure after salvaging that increment and reporting the rest as
# unpublished; PRs already published are untouched.
inc_run_later() {
  local i n id dep base_ref pr_base branch base_sha agent_status=0 failed="" failed_reason=""
  local todo_ids
  n=$(jq 'length' "$INC_PLAN_FILE")
  for ((i = 0; i < n; i++)); do
    id=$(jq -r ".[$i].id" "$INC_PLAN_FILE")
    if [ -n "$failed" ]; then
      INC_STATE[$id]=skipped
      INC_REASON[$id]="not attempted after increment \"$failed\" failed"
      inc_emit_unpublished "$id" "${INC_REASON[$id]}"
      continue
    fi
    dep=${INC_DEP[$id]}
    if [ -n "$dep" ]; then
      base_ref=${INC_BRANCH[$dep]}
      pr_base=${INC_BRANCH[$dep]}
    else
      base_ref=origin/$INC_DEFAULT_BASE
      pr_base=$INC_DEFAULT_BASE
    fi
    branch="${INC_BRANCH[$INC_CURRENT]}-$id"
    echo "=== Increment \"$id\": ${INC_TITLE[$id]} (base: $pr_base) ===" >&2

    todo_ids=$(jq -r ".[$i].todo_ids // [] | .[]" "$INC_PLAN_FILE")
    if ! git checkout -f -q -b "$branch" "$base_ref"; then
      failed=$id
      INC_STATE[$id]=failed
      INC_REASON[$id]="could not create a branch from $base_ref"
      inc_emit_unpublished "$id" "${INC_REASON[$id]}"
      continue
    fi
    base_sha=$(git rev-parse HEAD)
    rm -f "$META_FILE"

    agent_status=0
    agent_invoke "$(inc_later_prompt "$id" "$dep")" || agent_status=$?
    git checkout -q "$branch" || true
    [ "$(git rev-parse HEAD)" = "$base_sha" ] || git reset --soft "$base_sha"

    failed_reason=""
    INC_HISTORY_COMMAND="$INC_HISTORY_BASE_COMMAND: $id"
    if [ "$agent_status" -ne 0 ]; then
      failed_reason="agent exited with status $agent_status"
    elif [ -z "$(git status --porcelain)" ]; then
      failed_reason="the agent produced no changes"
    elif ! inc_apply_todo_cleanup "$base_sha" $todo_ids; then
      failed_reason="TODO.md cleanup was rejected"
    elif [ -n "$todo_ids" ] && [ -z "$(git status --porcelain -- ':(exclude)TODO.md')" ]; then
      failed_reason="no changes besides TODO.md, so the TODO row(s) were not resolved"
    elif ! inc_publish "$id" "$branch" "$pr_base" "$base_sha" "${INC_TASK[$id]}" \
      "chore: ${INC_TITLE[$id]}" "- ${INC_TITLE[$id]}"; then
      failed_reason="checks, commit, push or pull request creation failed"
    fi

    if [ -n "$failed_reason" ]; then
      echo "ERROR: increment \"$id\" was not published: $failed_reason." >&2
      failed=$id
      INC_STATE[$id]=failed
      INC_REASON[$id]=$failed_reason
      if [ -z "${INC_URL[$id]:-}" ]; then
        inc_salvage "$branch" "$pr_base" "$base_sha" "${INC_TITLE[$id]}" "${INC_TASK[$id]}" "$((agent_status == 0 ? 1 : agent_status))" "$id"
      fi
      [ "${INC_STATE[$id]}" = salvaged ] || inc_emit_unpublished "$id" "$failed_reason"
    fi
  done
  [ -z "$failed" ]
}
