#!/bin/bash
set -euo pipefail

MODE=""
ID=""
TASK=""
REMOVAL_ID=""
TODO_REMOVAL_REQUEST_RE='^Remove TODO\.md row ([0-9a-f]{6})([.:[:space:]]|$)'
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

AGENT_RUNNER=${SOLVE_AGENT:-claude}
case "$AGENT_RUNNER" in
  claude | codex | ollama) ;;
  *)
    echo "ERROR: SOLVE_AGENT must be 'claude', 'codex' or 'ollama'." >&2
    exit 1
    ;;
esac
if [ "$AGENT_RUNNER" = codex ]; then
  MODEL=${CODEX_MODEL:-}
  RUNNER_LABEL=Codex
  PR_FOOTER='Generated with [Codex](https://openai.com/codex)'
  FALLBACK_TRAILER='Co-authored-by: Codex <noreply@openai.com>'
else
  MODEL=${SOLVE_MODEL:-sonnet}
  RUNNER_LABEL="Claude Code"
  PR_FOOTER='🤖 Generated with [Claude Code](https://claude.com/claude-code)'
  FALLBACK_TRAILER='Co-authored-by: Claude <noreply@anthropic.com>'
fi
if [ "$AGENT_RUNNER" = ollama ]; then
  MODEL=${OLLAMA_MODEL:-qwen3-coder:30b}
  RUNNER_LABEL="Ollama ($MODEL via Claude Code)"
  PR_FOOTER='Generated with [Ollama](https://ollama.com)'
  FALLBACK_TRAILER=''
fi
PREVIEW=${SOLVE_PREVIEW:-0}
REPO_DIR=${REPO_DIR:-$HOME/vigilant-broccoli}
META_FILE=${META_FILE:-/tmp/solve-meta.json}
PRE_COMMIT_HELPER="$REPO_DIR/infrastructure/agent-sandbox/run-pre-commit.sh"
MERGE_BODY_HELPER="$REPO_DIR/infrastructure/agent-sandbox/merge-pr-body.py"

cd "$REPO_DIR"
SKILL_INSTRUCTIONS=$(cat "$REPO_DIR/setup/dotfiles/agent-skills/agentic-pr-create/SKILL.md")
# shellcheck source=pr-increments.sh
. "$(dirname "${BASH_SOURCE[0]}")/pr-increments.sh"
# shellcheck source=no-changes.sh
. "$(dirname "${BASH_SOURCE[0]}")/no-changes.sh"

if [ "$MODE" = id ]; then
  # TODO items live as rows in per-section markdown tables (ID | Priority |
  # Agent | Effort | Brief | Description | Recommended Fix). Extract the nearest table header plus the
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
  PLAN_REQUEST=$ID
  SCOPE_RULE="- Do not run any git or gh commands and do not edit TODO.md — branching, TODO.md cleanup, committing, pushing, and opening the PR are all handled by the calling script. TODO ${ID} is removed by the one increment that fully resolves it (this one unless you assign it to a later increment in todo_ids)."
elif [ "$MODE" = prompt ]; then
  SLUG=$(echo "$TASK" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | sed 's/^-*//;s/-*$//' | cut -c1-40)
  BRANCH="agent/task-${SLUG:-task}-$(date +%s)"
  INTRO="Accomplish this task:"
  PLAN_REQUEST=$TASK
  SCOPE_RULE="- Do not run any git or gh commands and do not edit TODO.md — branching, TODO.md cleanup, committing, pushing, and opening the PR are all handled by the calling script."
  # A request in this exact form is the user's authorization for a TODO-only
  # PR, the one case the "no changes besides TODO.md" guard below must let
  # through. Matching the request, not trusting the agent, keeps an agent from
  # dropping a row it merely failed to fix.
  if [[ $TASK =~ $TODO_REMOVAL_REQUEST_RE ]]; then
    REMOVAL_ID=${BASH_REMATCH[1]}
    BRANCH="agent/remove-todo-${REMOVAL_ID}"
    SCOPE_RULE="- This is a TODO-only removal: change no files, and declare ${REMOVAL_ID} in todo_ids so the calling script removes its TODO.md row. Base pr_title and summary on the stated reason. Do not run any git or gh commands."
  fi
else
  echo "Usage: solve-todo-runner.sh (--id <TODO_ID> | --prompt <text>)" >&2
  exit 1
fi

if [ -n "${GITHUB_ACTIONS:-}" ]; then
  REQUEST_SOURCE="GitHub Actions (manual-agentic-pr-create workflow, ${RUNNER_LABEL})"
elif [ -n "${SOLVE_ON_CODE_SERVER:-}" ]; then
  REQUEST_SOURCE="code-server VM (pnpm agentic-pr-create --vm, ${RUNNER_LABEL})"
else
  REQUEST_SOURCE="Local CLI (pnpm agentic-pr-create, ${RUNNER_LABEL})"
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

INC_REQUEST=$TASK
INC_SKILL_INSTRUCTIONS=$SKILL_INSTRUCTIONS
INC_ORDER=("$INC_CURRENT")
INC_BRANCH[$INC_CURRENT]=$BRANCH
if [ -n "${GITHUB_ACTIONS:-}" ]; then
  INC_HISTORY_SOURCE="GitHub Actions"
elif [ -n "${SOLVE_ON_CODE_SERVER:-}" ]; then
  INC_HISTORY_SOURCE="code-server VM"
else
  INC_HISTORY_SOURCE="Docker sandbox (local)"
fi
if [ "$MODE" = id ]; then
  INC_HISTORY_BASE_COMMAND="agentic-pr-create ${ID}"
  SALVAGE_TITLE="Resolve TODO ${ID}"
  FALLBACK_SUBJECT="chore: Resolve TODO ${ID}."
  FALLBACK_SUMMARY="- Resolve TODO ${ID}."
else
  INC_HISTORY_BASE_COMMAND="agentic-pr-create --prompt"
  SALVAGE_TITLE=$TASK
  FALLBACK_SUBJECT="chore: Complete agent task."
  FALLBACK_SUMMARY="- ${TASK}"
fi
INC_HISTORY_COMMAND=$INC_HISTORY_BASE_COMMAND
INC_TITLE[$INC_CURRENT]=$SALVAGE_TITLE

# Only the first increment is rescued by this trap; once its PR is open, each
# later increment salvages itself in inc_run_later and the PRs already published
# stay as they are.
SALVAGE_ENABLED=1
[ "$PREVIEW" != 1 ] || SALVAGE_ENABLED=0
salvage_on_failure() {
  local exit_code=$?
  trap - EXIT
  set +e
  [ -z "${CODEX_RUN_HOME:-}" ] || rm -rf "$CODEX_RUN_HOME"
  [ "$exit_code" -eq 0 ] && exit 0
  [ "$SALVAGE_ENABLED" = 1 ] || exit "$exit_code"

  echo "Runner exited with status $exit_code — checking for salvageable work on $BRANCH" >&2
  inc_salvage "$BRANCH" "$INC_DEFAULT_BASE" "$BASE_SHA" "$SALVAGE_TITLE" "$REQUEST_BODY" "$exit_code" "$INC_CURRENT"
  local id
  for id in "${INC_ORDER[@]:1}"; do
    inc_emit_unpublished "$id" "the first increment was not published"
  done
  exit "$exit_code"
}
trap salvage_on_failure EXIT

PREVIEW_RULE=""
if [ "$PREVIEW" = 1 ]; then
  PREVIEW_RULE="- This is a development preview: retain edits without committing or publishing. Report validation and remaining work; use --agent ollama in ready-to-run follow-up commands."
fi

PROMPT=$(cat <<EOF
You are running non-interactively in a fresh clone of vigilant-broccoli, on a dedicated branch. $INTRO

$TASK

Follow these shared task instructions:

$SKILL_INSTRUCTIONS

Sandbox execution rules:
- You are already inside the unattended sandbox mentioned in the skill; complete the task here without launching another sandbox.
$SCOPE_RULE
$PREVIEW_RULE
$(inc_plan_instructions solve)
- When finished, write $META_FILE containing only a JSON object with these fields (strings unless noted):
  - commit_type: one of feat, fix, ci, chore, docs, refactor, enhancement, security, infrastructure
  - commit_scope: the affected app/service/lib name, or "" when the change is not scoped to one
  - commit_message: capitalized, concise, focused on why not what, ending with a period
  - co_authored_by: the Co-Authored-By trailer line specified by your environment for the model authoring the commit, or "$FALLBACK_TRAILER" when no such trailer is specified
  - pr_title: the pull request title in the form "<committype>(<scope>): <Message>." (scope omitted when unscoped)
  - pr_summary: markdown bullet points for the PR "## Summary" section, describing only the increment you implemented
  - pr_next_steps: markdown checklist for the PR "## Next steps" section — concrete remaining actions for the human (manual commands to run, UI/manual spot checks, watching CI to green, then one ready-to-run \`pnpm agentic-pr-create --prompt "<task>"\` item per piece of work deliberately left out of every increment), or "- [ ] Merge once CI is green" when nothing else is left
  - pr_suggestions: markdown bullet points for the PR "## Suggestions" section — follow-up recommendations for the reviewer (gaps, risks, related cleanups worth a separate PR), or "" when there are none
  - pr_concerns: markdown bullet points for the PR "## Concerns" section — problems the reviewer must weigh before merging (risks, known limitations, unverified behavior, unresolved questions, assumptions that may be wrong), or "" when there are none. Keep these out of pr_suggestions, which is only for optional follow-up work
  - todo_ids: array of the TODO.md ids this increment fully resolves (omit or [] when none)
  - increments: the optional array of later increments described above
$NO_CHANGES_FIELD
EOF
)

CODEX_LOGGED_IN=0
agent_invoke() {
  local prompt=$1
  case "$AGENT_RUNNER" in
    ollama)
      env -u CLAUDE_CODE_OAUTH_TOKEN -u GH_TOKEN -u GITHUB_TOKEN \
        ANTHROPIC_BASE_URL="${OLLAMA_BASE_URL:?OLLAMA_BASE_URL is required}" \
        ANTHROPIC_AUTH_TOKEN=ollama ANTHROPIC_API_KEY= \
        ANTHROPIC_DEFAULT_HAIKU_MODEL="$MODEL" \
        ANTHROPIC_DEFAULT_SONNET_MODEL="$MODEL" \
        ANTHROPIC_DEFAULT_OPUS_MODEL="$MODEL" \
        CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1 \
        claude -p "$prompt" --dangerously-skip-permissions --model "$MODEL" \
        --disallowedTools "Bash(git:*)" "Bash(gh:*)" "WebSearch" "WebFetch"
      ;;
    claude)
      # Auto mode's classifier blocks exfiltration, credential reads and remote
      # code execution, which matters most on the firewall-less --vm path.
      # SOLVE_PERMISSION_MODE=bypass restores --dangerously-skip-permissions.
      local permission_args=(--permission-mode auto)
      [ "${SOLVE_PERMISSION_MODE:-auto}" != bypass ] || permission_args=(--dangerously-skip-permissions)
      claude -p "$prompt" "${permission_args[@]}" --model "$MODEL" \
        --disallowedTools "Bash(git commit:*)" "Bash(git push:*)" "Bash(git checkout:*)" "Bash(git switch:*)" "Bash(gh:*)"
      ;;
    codex)
      # CODEX_SIGNED_IN: the dev sandbox's own Codex login (~/.codex) and sessions
      # are used as-is, so there is no access token and no throwaway home.
      if [ "$CODEX_LOGGED_IN" = 0 ] && [ "${CODEX_SIGNED_IN:-0}" != 1 ]; then
        if [ -z "${AGENT_CODEX_ACCESS_TOKEN:-}" ]; then
          echo "ERROR: AGENT_CODEX_ACCESS_TOKEN is required for SOLVE_AGENT=codex." >&2
          return 1
        fi
        # Not under /tmp: workspace-write leaves /tmp writable for $META_FILE, so
        # the agent could read the access token out of $CODEX_HOME/auth.json.
        CODEX_RUN_HOME=$(mktemp -d "$HOME/.codex-run.XXXXXX")
        export CODEX_HOME=$CODEX_RUN_HOME
        printf '%s\n' "$AGENT_CODEX_ACCESS_TOKEN" | codex login --with-access-token >/dev/null
        unset AGENT_CODEX_ACCESS_TOKEN CODEX_ACCESS_TOKEN OPENAI_API_KEY CODEX_API_KEY
        CODEX_LOGGED_IN=1
      fi

      local codex_args=(
        exec
        --cd "$REPO_DIR"
        # Codex ignores a repo-local .codex/config.toml, and this runner's
        # $CODEX_HOME is a fresh directory, so the limit has to be passed here:
        # the root CONTEXT.md is over the 32 KiB default and would be silently
        # truncated.
        -c project_doc_max_bytes=65536
        # --approve-for-me selects the workspace-write sandbox itself and Codex
        # rejects combining it with --sandbox.
        --approve-for-me
        --output-last-message "${CODEX_LAST_MESSAGE_FILE:-/tmp/codex-last-message.txt}"
      )
      [ "${CODEX_SIGNED_IN:-0}" = 1 ] || codex_args+=(--ephemeral)
      [ -z "$MODEL" ] || codex_args+=(--model "$MODEL")
      # No GitHub credentials: codex exec has no tool deny-list of its own, so
      # dropping the token is what keeps the agent off the push/PR path that the
      # Claude branch blocks with --disallowedTools.
      env -u GH_TOKEN -u GITHUB_TOKEN codex "${codex_args[@]}" "$prompt"
      ;;
  esac
}

agent_invoke "$PROMPT"

if [ "$AGENT_RUNNER" = ollama ]; then
  jq -e 'type == "object"' "$META_FILE" >/dev/null || {
    echo "ERROR: the local agent did not produce valid metadata; its checkout is retained." >&2
    exit 1
  }
fi

git checkout "$BRANCH"
[ "$(git rev-parse HEAD)" = "$BASE_SHA" ] || git reset --soft "$BASE_SHA"

if [ -z "$REMOVAL_ID" ] && [ -z "$(git status --porcelain)" ]; then
  no_changes_exit "$META_FILE" "no changes produced — task was not completed."
fi

# The whole plan is checked before the first PR is opened, so a bad plan never
# leaves a partial stack behind.
inc_validate_plan "$META_FILE" "$BASE_SHA" "$PLAN_REQUEST" "${ID:-}"
inc_load_plan "$META_FILE"

RESOLVED_IDS=()
while IFS= read -r resolved_id; do
  [ -z "$resolved_id" ] || RESOLVED_IDS+=("$resolved_id")
done < <(inc_current_todo_ids "$META_FILE" "${ID:-}")
inc_apply_todo_cleanup "$BASE_SHA" ${RESOLVED_IDS[@]+"${RESOLVED_IDS[@]}"}
if [ -n "$REMOVAL_ID" ]; then
  if [ "${RESOLVED_IDS[*]-}" != "$REMOVAL_ID" ] || [ -n "$(git status --porcelain -- ':(exclude)TODO.md')" ] || [ -z "$(git status --porcelain -- TODO.md)" ]; then
    no_changes_exit "$META_FILE" "TODO-only removal of ${REMOVAL_ID} must remove exactly that row and change nothing else."
  fi
elif [ "${#RESOLVED_IDS[@]}" -gt 0 ] && [ -z "$(git status --porcelain -- ':(exclude)TODO.md')" ]; then
  no_changes_exit "$META_FILE" "no changes besides TODO.md — ${RESOLVED_IDS[*]} not resolved."
fi

if [ "$PREVIEW" = 1 ]; then
  bash "$PRE_COMMIT_HELPER"
  echo "LOCAL_PREVIEW::Changes retained in $REPO_DIR; metadata: $META_FILE"
  echo "Planned follow-up increments are recorded in the metadata and were not executed."
  exit 0
fi

inc_publish "$INC_CURRENT" "$BRANCH" "$INC_DEFAULT_BASE" "$BASE_SHA" "$TASK" "$FALLBACK_SUBJECT" "$FALLBACK_SUMMARY" || exit 1
SALVAGE_ENABLED=0

LATER_STATUS=0
inc_run_later || LATER_STATUS=1
inc_refresh_stacks || true
exit "$LATER_STATUS"
