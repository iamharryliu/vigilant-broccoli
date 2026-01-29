#!/usr/bin/env bash

SESSION="vb"
PROJECT="$HOME/vigilant-broccoli"

tmux has-session -t "$SESSION" 2>/dev/null && tmux attach -t "$SESSION"

tmux new-session -d -s "$SESSION"

#################################
# Window 1: tools (4 panes)
#################################
tmux rename-window -t "$SESSION:1" tools

# Split into 2x2 grid
tmux split-window -h  -t "$SESSION:1"
tmux split-window -v  -t "$SESSION:1.1"
tmux split-window -v  -t "$SESSION:1.2"

tmux select-layout -t "$SESSION:1" tiled

# Pane commands
tmux send-keys -t "$SESSION:1.1" "yazi" C-m
tmux send-keys -t "$SESSION:1.2" "btop" C-m
tmux send-keys -t "$SESSION:1.3" "clear" C-m
tmux send-keys -t "$SESSION:1.4" "lazydocker" C-m

#################################
# Window 2: dev (2 panes)
#################################
tmux new-window -t "$SESSION" -n dev

tmux split-window -h -t "$SESSION:2"
tmux select-layout -t "$SESSION:2" even-horizontal

tmux send-keys -t "$SESSION:2.1" "cd $PROJECT && nvim ." C-m
tmux send-keys -t "$SESSION:2.2" "cd $PROJECT && lazygit" C-m

#################################
# Window 3: scratch
#################################
tmux new-window -t "$SESSION" -n bg
tmux send-keys -t "$SESSION:3.1" "neovideterminal" C-m

#################################
# Focus
#################################
tmux select-window -t "$SESSION:1"
tmux attach -t "$SESSION"
