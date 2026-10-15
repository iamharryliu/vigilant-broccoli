#!/bin/bash
set -euo pipefail

CONTAINER=vb-agent-sandbox
WORKDIR=/home/agent/vigilant-broccoli
SESSION=codexyolo

printf -v COMMAND '%q ' codex --dangerously-bypass-approvals-and-sandbox "$@"

exec docker exec -it -u agent -w "$WORKDIR" "$CONTAINER" \
  tmux new-session -A -s "$SESSION" -c "$WORKDIR" "$COMMAND"
