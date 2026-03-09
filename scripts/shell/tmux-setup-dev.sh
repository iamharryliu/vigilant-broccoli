#!/usr/bin/env bash

TARGET_PATH="${1:-.}"

if [ ! -d "$TARGET_PATH" ]; then
  echo "Error: Directory '$TARGET_PATH' does not exist"
  exit 1
fi

TARGET_PATH=$(cd "$TARGET_PATH" && pwd)

tmux split-window -h
tmux split-window -v
tmux select-pane -t 2
tmux split-window -h

tmux select-pane -t 0
tmux send-keys "cd $TARGET_PATH && nvim ." C-m

tmux select-pane -t 1
tmux send-keys "cd $TARGET_PATH && lazygit" C-m

tmux select-pane -t 2
tmux send-keys "cd $TARGET_PATH" C-m

tmux select-pane -t 3
tmux send-keys "cd $TARGET_PATH" C-m

tmux select-pane -t 0
