#!/bin/bash
# Streamed by solve-vm.sh into the code-server container (as abc, HOME=/config):
#   solve-vm-session.sh <agent> <claude-model> <codex-model> (--id <TODO_ID> | --prompt <task>)...
# Each request gets its own worktree off fresh origin/main and a detached tmux
# session running solve-todo-runner.sh, which publishes the PRs. There is no
# egress firewall here, unlike the Docker sandbox. For agent codex, solve-vm.sh
# prepends an AGENT_CODEX_ACCESS_TOKEN assignment to this script's stdin.
set -euo pipefail

AGENT=$1
MODEL=$2
CODEX_MODEL=$3
shift 3
REPO=/config/vigilant-broccoli
RUNS_DIR=/config/agentic-runs

# The tmux body: serialized with `declare -f`, because this script arrives on
# stdin and has no file a session could run.
run_solve() {
  local repo=$1 run_dir=$2 flag=$3 value=$4 agent=$5 model=$6 codex_model=$7
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
  REPO_DIR=$worktree META_FILE="$run_dir/solve-meta.json" INC_PLAN_FILE="$run_dir/increment-plan.json" \
    SOLVE_AGENT=$agent SOLVE_MODEL=$model CODEX_MODEL=$codex_model SOLVE_ON_CODE_SERVER=1 \
    bash infrastructure/agent-sandbox/solve-todo-runner.sh "$flag" "$value" 2>&1 | tee "$run_dir/run.log" || status=$?
  # Worktrees share the repository's branches, so the agent/* branches this
  # run checked out are deleted with it (they are pushed by then); otherwise a
  # re-run of the same TODO id fails on `git checkout -b agent/todo-<id>`.
  branches=$(git reflog --format=%gs HEAD | sed -n 's/^checkout: moving from .* to \(agent\/.*\)$/\1/p' | sort -u)
  if [ "$status" = 0 ]; then
    cd "$repo"
    git worktree remove --force "$worktree"
    for branch in $branches; do git branch -D "$branch" >/dev/null || true; done
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
  if [ "$flag" = --id ]; then
    label="todo-$value"
  else
    label="task-$(echo "$value" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | sed 's/^-*//;s/-*$//' | cut -c1-30)"
  fi
  run_dir=$(mktemp -d "$RUNS_DIR/$(date +%Y%m%d-%H%M%S)-${label}.XXXX")
  session=$(basename "$run_dir" | tr '.' '-')
  if [ "$AGENT" = codex ]; then
    (umask 077 && printf '%s' "$AGENT_CODEX_ACCESS_TOKEN" >"$run_dir/codex-token")
  fi
  git -C "$REPO" worktree add --quiet --detach "$run_dir/repo" origin/main
  printf -v body '%s; run_solve %q %q %q %q %q %q %q' "$(declare -f run_solve)" "$REPO" "$run_dir" "$flag" "$value" "$AGENT" "$MODEL" "$CODEX_MODEL"
  tmux new-session -d -s "$session" bash -c "$body"
  if [ "$AGENT" = codex ]; then
    echo "Started $session (agent: codex, model: ${CODEX_MODEL:-default})"
  else
    echo "Started $session (model: $MODEL)"
  fi
  echo "  log:    $run_dir/run.log"
  echo "  attach: tmux attach -t $session   (in the code-server terminal)"
done
