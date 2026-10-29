#!/bin/bash
# shellcheck disable=SC2034 # Variables are consumed by the sourcing update runner.
# Sourced before checkout and again after the runner defines its Claude adapter.
update_pr_vm_paths() {
  local run_dir=${META_FILE%/*}
  PRE_COMMIT_HELPER="$run_dir/run-pre-commit.sh"
  FORMAT_CHANGED_HELPER="$run_dir/format-changed.sh"
  MERGE_BODY_HELPER="$run_dir/merge-pr-body.py"
  SCREENSHOTS_HELPER="$run_dir/pr-screenshots.py"
  CI_LOG="$run_dir/pr-ci-failures.log"
  RUN_LOG="$run_dir/pr-ci-run.log"
  UPDATE_PR_HISTORY_SOURCE='code-server VM'
  # Worktrees share branch refs; refuse a second update of the same PR.
  exec 9>"/config/agentic-runs/update-pr-${PR##*/}.lock"
  if ! flock -n 9; then
    echo "ERROR: another VM update of PR ${PR##*/} is running." >&2
    exit 1
  fi
}

if [ "${SOLVE_AGENT:-claude}" = codex ]; then
  PR_FOOTER='Generated with [Codex](https://openai.com/codex)'
  FALLBACK_TRAILER='Co-authored-by: Codex <noreply@openai.com>'
  agent_invoke() (
    set -euo pipefail
    local codex_run_home=""
    trap '[ -z "$codex_run_home" ] || rm -rf "$codex_run_home"' EXIT
    if [ "${CODEX_SIGNED_IN:-0}" != 1 ]; then
      # Keep auth outside the writable workspace and /tmp, as create solves do.
      codex_run_home=$(mktemp -d "$HOME/.codex-run.XXXXXX")
      export CODEX_HOME=$codex_run_home
      printf '%s\n' "${AGENT_CODEX_ACCESS_TOKEN:?Codex access token missing}" | codex login --with-access-token >/dev/null
    fi
    unset AGENT_CODEX_ACCESS_TOKEN CODEX_ACCESS_TOKEN OPENAI_API_KEY CODEX_API_KEY
    local args=(exec --cd "$REPO_DIR" -c project_doc_max_bytes=65536 --approve-for-me
      --output-last-message "${META_FILE%/*}/codex-last-message.txt")
    [ "${CODEX_SIGNED_IN:-0}" = 1 ] || args+=(--ephemeral)
    [ -z "${CODEX_MODEL:-}" ] || args+=(--model "$CODEX_MODEL")
    env -u GH_TOKEN -u GITHUB_TOKEN codex "${args[@]}" "$1"
  )
fi
