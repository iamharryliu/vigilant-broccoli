#!/usr/bin/env bash

SESSION="vb"
PROJECT="$HOME/vigilant-broccoli"

tmux has-session -t "$SESSION" 2>/dev/null && tmux attach -t "$SESSION" && exit 0

tmux new-session -d -s "$SESSION"

#################################
# Window 1: neovim
#################################
tmux rename-window -t "$SESSION:1" neovim
tmux send-keys -t "$SESSION:1.1" "neovidetmuxvb" C-m

#################################
# Window 2: vb (2 panes)
#################################
tmux new-window -t "$SESSION" -n vb -c "$PROJECT"

DEV_PANE=$(tmux display-message -t "$SESSION:vb" -p '#{pane_id}')
tmux split-window -h -t "$DEV_PANE" -c "$PROJECT"

tmux send-keys -t "$DEV_PANE" "cd $PROJECT && claude" C-m
tmux select-pane -t "$DEV_PANE"

#################################
# Focus
#################################
tmux select-window -t "$SESSION:vb"
tmux attach -t "$SESSION"
