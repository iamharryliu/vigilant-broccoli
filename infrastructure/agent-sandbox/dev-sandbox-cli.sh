#!/bin/bash
set -euo pipefail

CONTAINER=vb-agent-sandbox
WORKDIR=/home/agent/vigilant-broccoli
AGENT=${1:-}
MODE=${2:-}
if [[ "$AGENT" == shell ]]; then
  MODE=
fi

case "$MODE:$AGENT" in
  :shell) CLI=(bash) ;;
  auto:claude) CLI=(claude --model sonnet --permission-mode auto) ;;
  yolo:claude) CLI=(claude --model sonnet --dangerously-skip-permissions) ;;
  auto:codex)
    CLI=(codex --sandbox workspace-write --ask-for-approval on-request
      -c 'approvals_reviewer="auto_review"')
    ;;
  yolo:codex) CLI=(codex --dangerously-bypass-approvals-and-sandbox) ;;
  *)
    echo "Usage: pnpm agentic:dev-sandbox:{claude,codex}:{auto,yolo} [CLI arguments...] or pnpm agentic:dev-sandbox:shell" >&2
    exit 1
    ;;
esac
if [[ "$AGENT" == shell ]]; then
  shift
else
  shift 2
fi

if [[ "$AGENT" == shell ]]; then
  COMMAND=("${CLI[@]}" "$@")
else
  SESSION="$AGENT-$MODE"
  printf -v CLI_COMMAND '%q ' "${CLI[@]}" "$@"
  COMMAND=(tmux new-session -A -s "$SESSION" -c "$WORKDIR" "$CLI_COMMAND")
fi

STATUS=0
DOCKER_CLI_HINTS=false docker exec -it -u agent -w "$WORKDIR" "$CONTAINER" "${COMMAND[@]}" || STATUS=$?

# Bash inherits the last command's status when exiting without an explicit code,
# so exiting after Ctrl-C can return 130 even though the interactive session ended normally.
if [[ "$STATUS" -eq 130 ]]; then
  exit 0
fi
exit "$STATUS"
