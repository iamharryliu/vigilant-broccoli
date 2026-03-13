#!/usr/bin/env bash

TARGET_PATH="${1:-.}"

if [ ! -d "$TARGET_PATH" ]; then
  echo "Error: Directory '$TARGET_PATH' does not exist"
  exit 1
fi

TARGET_PATH=$(cd "$TARGET_PATH" && pwd)

CURRENT_PANE=$(tmux display-message -p '#{pane_id}')

tmux split-window -h -t "$CURRENT_PANE"
RIGHT_TOP=$(tmux display-message -p '#{pane_id}')

tmux split-window -v -t "$RIGHT_TOP"
RIGHT_BOTTOM_LEFT=$(tmux display-message -p '#{pane_id}')

tmux split-window -h -t "$RIGHT_BOTTOM_LEFT"

tmux send-keys -t "$CURRENT_PANE" "cd $TARGET_PATH && nvim ." C-m
tmux send-keys -t "$RIGHT_TOP" "cd $TARGET_PATH && lazygit" C-m
tmux send-keys -t "$RIGHT_BOTTOM_LEFT" "cd $TARGET_PATH" C-m

tmux select-pane -t "$CURRENT_PANE"
