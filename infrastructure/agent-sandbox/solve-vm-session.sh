#!/bin/bash
# Streamed by solve-vm.sh into the code-server container (as abc, HOME=/config):
#   solve-vm-session.sh <agent> <claude-model> <codex-model> <codex-signed-in 0|1> (--id <TODO_ID> | --prompt <task>)...
# Each request gets its own worktree off fresh origin/main and a detached tmux
# session running solve-todo-runner.sh, which publishes the PRs. There is no
# egress firewall here, unlike the Docker sandbox. For agent codex, solve-vm.sh
# prepends an AGENT_CODEX_ACCESS_TOKEN assignment to this script's stdin, unless
# codex-signed-in is 1: then runs use the ~/.codex login (HOME=/config) as is.
set -euo pipefail

AGENT=$1
MODEL=$2
CODEX_MODEL=$3
CODEX_SIGNED_IN=$4
shift 4
REPO=/config/vigilant-broccoli
RUNS_DIR=/config/agentic-runs

# The tmux body: serialized with `declare -f`, because this script arrives on
# stdin and has no file a session could run.
run_solve() {
  local repo=$1 run_dir=$2 flag=$3 value=$4 agent=$5 model=$6 codex_model=$7 signed_in=$8
  local worktree="$run_dir/repo" status=0 branches
  cd "$worktree"
  # Read and delete the token before the runner starts: it logs Codex into a
  # throwaway home and unsets the variable, so the agent can read neither.
  if [ -f "$run_dir/codex-token" ]; then
    AGENT_CODEX_ACCESS_TOKEN=$(<"$run_dir/codex-token")
    export AGENT_CODEX_ACCESS_TOKEN
    rm -f "$run_dir/codex-token"
  fi
  set -o pipefail
  if [ "$flag" = --update ]; then
    export UPDATE_PR_VM_HELPER="$run_dir/update-pr-vm-agent.sh"
    SANDBOX_CI_LOGS=$(<"$run_dir/ci-logs")
    export SANDBOX_CI_LOGS
    case "$(<"$run_dir/operation")" in
      fix-ci) export SANDBOX_FIX_CI=1 ;;
      resolve-conflicts) export SANDBOX_MERGE_MAIN=1 ;;
    esac
    REPO_DIR=$worktree META_FILE="$run_dir/update-meta.json" INC_PLAN_FILE="$run_dir/increment-plan.json" \
      SOLVE_AGENT=$agent SOLVE_MODEL=$model CODEX_MODEL=$codex_model CODEX_SIGNED_IN=$signed_in SOLVE_ON_CODE_SERVER=1 \
      bash "$run_dir/update-pr-runner.sh" "$value" "$(<"$run_dir/instruction")" 2>&1 | tee "$run_dir/run.log" || status=$?
  else
    REPO_DIR=$worktree META_FILE="$run_dir/solve-meta.json" INC_PLAN_FILE="$run_dir/increment-plan.json" \
      SOLVE_AGENT=$agent SOLVE_MODEL=$model CODEX_MODEL=$codex_model CODEX_SIGNED_IN=$signed_in SOLVE_ON_CODE_SERVER=1 \
      bash infrastructure/agent-sandbox/solve-todo-runner.sh "$flag" "$value" 2>&1 | tee "$run_dir/run.log" || status=$?
  fi
  # Worktrees share the repository's branches, so the agent/* branches this
  # run checked out are deleted with it (they are pushed by then); otherwise a
  # re-run of the same TODO id fails on `git checkout -b agent/todo-<id>`.
  branches=$(git reflog --format=%gs HEAD | sed -n 's/^checkout: moving from .* to \(agent\/.*\)$/\1/p' | sort -u)
  if [ "$status" = 0 ]; then
    cd "$repo"
    git worktree remove --force "$worktree"
    if [ "$flag" != --update ]; then
      for branch in $branches; do git branch -D "$branch" >/dev/null || true; done
    fi
  else
    echo "Kept $worktree for inspection; remove it with: git -C $repo worktree remove --force $worktree" | tee -a "$run_dir/run.log"
  fi
  echo "RUN_EXIT::$status" | tee -a "$run_dir/run.log"
}

# Parallel launches share one repository, and concurrent fetches race on the
# refs/remotes/origin/main lock.
flock "$REPO/.git/agentic-fetch.lock" git -C "$REPO" fetch --quiet origin main
mkdir -p "$RUNS_DIR"

while [ $# -gt 0 ]; do
  flag=$1
  value=$2
  shift 2
  if [ "$flag" = --update ]; then
    instruction=$1 operation=$2 ci_logs=$3
    shift 3
    label="update-pr-${value##*/}"
  elif [ "$flag" = --id ]; then
    label="todo-$value"
  else
    label="task-$(echo "$value" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | sed 's/^-*//;s/-*$//' | cut -c1-30)"
  fi
  run_dir=$(mktemp -d "$RUNS_DIR/$(date +%Y%m%d-%H%M%S)-${label}.XXXX")
  session=$(basename "$run_dir" | tr '.' '-')
  if [ "$AGENT" = codex ] && [ "$CODEX_SIGNED_IN" != 1 ]; then
    (umask 077 && printf '%s' "$AGENT_CODEX_ACCESS_TOKEN" >"$run_dir/codex-token")
  fi
  if [ "$flag" = --update ]; then
    printf '%s\n' "$VM_UPDATE_RUNNER" > "$run_dir/update-pr-runner.sh"
    printf '%s\n' "$VM_UPDATE_HELPER" > "$run_dir/update-pr-vm-agent.sh"
    # The streamed runner sources these before checking out the PR's branch.
    cp "$REPO/infrastructure/agent-sandbox/"{pr-increments,no-changes,commit-subject}.sh "$run_dir/"
    printf '%s' "$instruction" > "$run_dir/instruction"
    printf '%s' "$operation" > "$run_dir/operation"
    printf '%s' "$ci_logs" > "$run_dir/ci-logs"
  fi
  git -C "$REPO" worktree add --quiet --detach "$run_dir/repo" origin/main
  printf -v body '%s; run_solve %q %q %q %q %q %q %q %q' "$(declare -f run_solve)" "$REPO" "$run_dir" "$flag" "$value" "$AGENT" "$MODEL" "$CODEX_MODEL" "$CODEX_SIGNED_IN"
  tmux new-session -d -s "$session" bash -c "$body"
  if [ "$AGENT" = codex ]; then
    echo "Started $session (agent: codex, model: ${CODEX_MODEL:-default})"
  else
    echo "Started $session (model: $MODEL)"
  fi
  echo "  log:    $run_dir/run.log"
  echo "  attach: tmux attach -t $session   (in the code-server terminal)"
done
