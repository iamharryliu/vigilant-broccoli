#!/usr/bin/env bash

SESSION="vb"
PROJECT="$HOME/vigilant-broccoli"

tmux has-session -t "$SESSION" 2>/dev/null && tmux attach -t "$SESSION" && exit 0

tmux new-session -d -s "$SESSION"

#################################
# Window 1: yazi
#################################
tmux rename-window -t "$SESSION:1" yazi
tmux send-keys -t "$SESSION:1.1" "yazi" C-m

#################################
# Window 2: btop
#################################
tmux new-window -t "$SESSION" -n btop
tmux send-keys -t "$SESSION:2.1" "btop" C-m

#################################
# Window 3: dev (4 panes)
#################################
tmux new-window -t "$SESSION" -n dev -c "$PROJECT"

DEV_PANE=$(tmux display-message -t "$SESSION:dev" -p '#{pane_id}')
tmux split-window -h -t "$DEV_PANE" -c "$PROJECT"

tmux send-keys -t "$DEV_PANE" "cd $PROJECT && claude" C-m
tmux select-pane -t "$DEV_PANE"

#################################
# Window 4: other
#################################
tmux new-window -t "$SESSION" -n other
tmux send-keys -t "$SESSION:4.1" "" C-m

#################################
# Window 5: neovide
#################################
tmux new-window -t "$SESSION" -n neovide
tmux send-keys -t "$SESSION:5.1" "neovidetmuxvb" C-m

#################################
# Focus
#################################
tmux select-window -t "$SESSION:3"
tmux attach -t "$SESSION"
