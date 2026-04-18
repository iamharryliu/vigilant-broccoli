#!/usr/bin/env bash

TARGET_PATH="."
WINDOW_NAME=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -n|--name) WINDOW_NAME="$2"; shift 2 ;;
    *) TARGET_PATH="$1"; shift ;;
  esac
done

if [ ! -d "$TARGET_PATH" ]; then
  echo "Error: Directory '$TARGET_PATH' does not exist"
  exit 1
fi

TARGET_PATH=$(cd "$TARGET_PATH" && pwd)
WINDOW_NAME="${WINDOW_NAME:-$(basename "$TARGET_PATH")}"

if [ -z "$TMUX" ]; then
  SESSION=$(tmux list-sessions -F "#{session_last_attached}:#{session_name}" 2>/dev/null | sort -rn | head -1 | cut -d: -f2)
  if [ -z "$SESSION" ]; then
    echo "Error: No tmux sessions found"
    exit 1
  fi
  tmux new-window -t "$SESSION" -n "$WINDOW_NAME" -c "$TARGET_PATH"
  tmux send-keys -t "$SESSION:=$WINDOW_NAME" "vibecode $TARGET_PATH" Enter
  tmux attach -t "$SESSION:=$WINDOW_NAME"
  exit 0
fi

CURRENT_PANE=$(tmux display-message -p '#{pane_id}')

tmux split-window -h -t "$CURRENT_PANE"
RIGHT_LEFT=$(tmux display-message -p '#{pane_id}')

tmux split-window -h -t "$RIGHT_LEFT"
RIGHT_RIGHT_TOP=$(tmux display-message -p '#{pane_id}')

tmux split-window -v -t "$RIGHT_RIGHT_TOP"
RIGHT_RIGHT_BOTTOM=$(tmux display-message -p '#{pane_id}')

tmux send-keys -t "$CURRENT_PANE" "cd $TARGET_PATH && claude" C-m
tmux send-keys -t "$RIGHT_LEFT" "cd $TARGET_PATH" C-m
tmux send-keys -t "$RIGHT_RIGHT_TOP" "cd $TARGET_PATH" C-m
tmux send-keys -t "$RIGHT_RIGHT_BOTTOM" "cd $TARGET_PATH && lazygit" C-m

tmux select-pane -t "$CURRENT_PANE"
