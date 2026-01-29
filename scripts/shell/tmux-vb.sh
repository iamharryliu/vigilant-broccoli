#!/usr/bin/env sh

SESSION="vb"
PROJECT_DIR="$HOME/vigilant-broccoli"

# Attach if already exists
tmux has-session -t "$SESSION" 2>/dev/null && {
  tmux attach -t "$SESSION"
  exit 0
}

# Create session
tmux new-session -d -s "$SESSION" -n main -c "$PROJECT_DIR"

# Capture initial pane (left pane)
LEFT_PANE=$(tmux list-panes -t "$SESSION":main -F "#{pane_id}" | head -1)

# Split RIGHT pane (btop) — capture pane ID
BTOP_PANE=$(tmux split-window -h -P -F "#{pane_id}" -t "$SESSION":main -c "$PROJECT_DIR")

# Split LEFT pane vertically — capture pane ID
NVIM_PANE=$(tmux split-window -v -P -F "#{pane_id}" -t "$LEFT_PANE" -c "$PROJECT_DIR")

# Remaining pane is top-left (yazi)
YAZI_PANE=$(tmux list-panes -t "$SESSION":main -F "#{pane_id}" | grep -v "$BTOP_PANE" | grep -v "$NVIM_PANE" | head -1)

# Start programs (now guaranteed correct)
tmux send-keys -t "$BTOP_PANE" 'btop' C-m
tmux send-keys -t "$YAZI_PANE" 'yazi' C-m
tmux send-keys -t "$NVIM_PANE" 'nvim ~/vigilant-broccoli' C-m

# Resize right pane (optional)
tmux resize-pane -t "$BTOP_PANE" -R 20

# Focus nvim
tmux select-pane -t "$NVIM_PANE"

tmux attach -t "$SESSION"
