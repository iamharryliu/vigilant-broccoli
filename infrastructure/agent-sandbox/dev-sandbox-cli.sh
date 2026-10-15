#!/bin/bash
set -euo pipefail

CONTAINER=vb-agent-sandbox
WORKDIR=/home/agent/vigilant-broccoli
AGENT=${1:-}
MODE=${2:-}

case "$MODE:$AGENT" in
  auto:claude) CLI=(claude --model sonnet --permission-mode auto) ;;
  yolo:claude) CLI=(claude --model sonnet --dangerously-skip-permissions) ;;
  auto:codex)
    CLI=(codex --sandbox workspace-write --ask-for-approval on-request
      -c 'approvals_reviewer="auto_review"')
    ;;
  yolo:codex) CLI=(codex --dangerously-bypass-approvals-and-sandbox) ;;
  *)
    echo "Usage: pnpm agentic:dev-sandbox:{claude,codex}:{auto,yolo} [CLI arguments...]" >&2
    exit 1
    ;;
esac
shift 2

SESSION="$AGENT-$MODE"
printf -v COMMAND '%q ' "${CLI[@]}" "$@"

exec docker exec -it -u agent -w "$WORKDIR" "$CONTAINER" \
  tmux new-session -A -s "$SESSION" -c "$WORKDIR" "$COMMAND"
