#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
USAGE='Usage: pnpm agentic-pr-update-fix-ci [--model <model>] <PR_NUMBER_OR_URL> [instruction]'
MODEL=sonnet
ARGS=()

while [ $# -gt 0 ]; do
  case "$1" in
    --model)
      if [ $# -lt 2 ] || [ -z "$2" ]; then
        echo "$USAGE" >&2
        exit 1
      fi
      MODEL=$2
      shift 2
      ;;
    --help|-h)
      echo "$USAGE"
      exit 0
      ;;
    *)
      ARGS+=("$1")
      shift
      ;;
  esac
done

PR="${ARGS[0]:-}"
if [ ${#ARGS[@]} -eq 0 ] || ! printf '%s' "$PR" | grep -qE '^([0-9]+|https://github\.com/[^[:space:]]+/[^[:space:]]+/pull/[0-9]+)$'; then
  echo "$USAGE" >&2
  exit 1
fi

EXTRA_INSTRUCTION="${ARGS[*]:1}"
INSTRUCTION="Fix the failing CI checks shown below using the shared CI-fix skill.${EXTRA_INSTRUCTION:+ Additional guidance: $EXTRA_INSTRUCTION}"
export SANDBOX_FIX_CI=1
exec bash "$SCRIPT_DIR/update-pr.sh" --model "$MODEL" --with-ci-logs "$PR" "$INSTRUCTION"
