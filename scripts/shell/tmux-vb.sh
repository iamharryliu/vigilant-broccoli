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
tmux send-keys -t "$SESSION:1.3" "lazydocker" C-m
tmux send-keys -t "$SESSION:1.4" "posting" C-m

#################################
# Window 2: dev (4 panes)
#################################
tmux new-window -t "$SESSION" -n dev -c "$PROJECT"
bash "$HOME/vigilant-broccoli/scripts/shell/tmux-setup-dev.sh" "$PROJECT"

#################################
# Window 3: other
#################################
tmux new-window -t "$SESSION" -n other
tmux send-keys -t "$SESSION:3.1" "" C-m

#################################
# Window 4: neovide
#################################
tmux new-window -t "$SESSION" -n neovide
tmux send-keys -t "$SESSION:4.1" "neovidetmuxvb" C-m

#################################
# Focus
#################################
tmux select-window -t "$SESSION:3"
tmux attach -t "$SESSION"
