#!/bin/bash
set -euo pipefail

CONTAINER=vb-agent-sandbox
WORKDIR=/home/agent/vigilant-broccoli
SESSION=cli

MODEL=sonnet
while [ $# -gt 0 ]; do
  case "$1" in
    --model)
      MODEL=$2
      shift 2
      ;;
    --model=*)
      MODEL="${1#*=}"
      shift
      ;;
    *)
      echo "Usage: pnpm agentic:dev-sandbox:cli [--model <model>]" >&2
      exit 1
      ;;
  esac
done

exec docker exec -it -u agent -w "$WORKDIR" "$CONTAINER" \
  tmux new-session -A -s "$SESSION" -c "$WORKDIR" \
  "claude --permission-mode auto --model $MODEL"
