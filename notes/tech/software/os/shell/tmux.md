# tmux

- **Server** - Manages sessions, windows, and panes. Started automatically when tmux is launched and persists in the background as long as at least one session exists.
- **Client** - A client represents a terminal connected to a tmux session. A session can have multiple clients attached to it simultaneously.
- **Session** - A top-level entity. Contains one or more windows and allows users to persist terminal states.
- **Window** - Similar to a tab. It exists within a session and contains one or more panes.
- **Pane** - A pane is a subdivision of a window, essentially a split terminal within the window.

```
brew install tmux                                   # Install tmux via Homebrew
tmux source-file ~/.tmux.conf
tmux clear-history

# Server
tmux start-server
tmux kill-server

# Clients
tmux list-clients                                   # List all connected clients
tmux detach-client                                  # Detach a client from a session

# Session
# CREATE
tmux                                                # Start new tmux session
tmux new-session -s SESSION_NAME                       # Create new session with name
tmux new-session -c /PATH                           # Create new session with working directory
tmux new -s SESSION_NAME                            # Create new session with name (short form)
tmux new -c /PATH                                   # Create new session with working directory (short form)
# READ
tmux list-sessions                                  # List all sessions
tmux ls                                             # List all sessions (short form)
KEY_BIND + S                                        # List session(s)
# CONNECT
tmux attach-session                                 # Attach to last session
tmux attach-session -t SESSION_NAME                 # Attach to specific session
tmux a                                              # Attach to last session (short form)
tmux a -t SESSION_NAME                              # Attach to specific session (short form)
KEY_BIND + $                                        # Rename session
tmux rename-session -t OLD_NAME                     # Rename current session
tmux rename-session -t OLD_NAME NEW_NAME            # Rename specific session
# DETACH
KEY_BIND + d                                        # Detach from current session
# DELETE
tmux kill-session                                   # Kill current session
tmux kill-session -t SESSION_NAME                   # Kill specific session

# Window
# CREATE
tmux new-window                                     # Create new window in current session
tmux new-window -c /PATH                            # Create new window with working directory
tmux new-window -n WINDOW_NAME                      # Create new window with name
KEY_BIND + c                                        # Create a new window
# READ
tmux list-windows                                   # List all windows.
KEY_BIND + w                                        # List windows interactively
KEY_BIND + f                                        # Find a window by name
# UPDATE
KEY_BIND + ,                                        # Rename current window
# NAVIGATE
tmux select-window -t WINDOW_INDEX_OR_NAME          # Switch to specific window
KEY_BIND + n                                        # Next window
KEY_BIND + p                                        # Previous window
KEY_BIND + 0...9                                    # Jump to window by number
tmux rename-window NEW_NAME                         # Rename current window
tmux swap-window -s N1 -t N2                        # Swap positions of two windows
# DELETE
KEY_BIND + &                                        # Kill the current window
tmux kill-window -t WINDOW_INDEX_OR_NAME            # Kill specific window

# Pane
# CREATE
tmux split-window -h                                # Split the current pane horizontally
tmux split-window -v                                # Split the current pane vertically
KEY_BIND + %                                        # Split vertically (left/right)
KEY_BIND + "                                        # Split horizontally (top/bottom)
# READ
tmux list-panes                                     # List all panes in the current window
# NAVIGATE
KEY_BIND + Arrows                                   # Move focus to neighbor pane
KEY_BIND + o                                        # Cycle through all panes
KEY_BIND + q                                        # Show pane numbers (type # to jump)
KEY_BIND + z                                        # Zoom/Unzoom current pane
tmux select-pane                                    # Switch to a specific pane by direction or index
tmux select-pane -L
tmux select-pane -R
tmux select-pane -U
tmux select-pane -D
tmux select-pane -t ID
tmux select-pane -l                                 # Switch focus to the last active pane
# UPDATE / RESIZE
KEY_BIND + Ctrl + Arrows                            # Resize pane by 1 unit
KEY_BIND + Alt + Arrows                             # Resize pane by 5 units
KEY_BIND + Space                                    # Cycle preset layouts
KEY_BIND + !                                        # Break pane out to new window
KEY_BIND + {                                        # Move current pane left/up
KEY_BIND + }                                        # Move current pane right/down
tmux resize-pane -L N
tmux resize-pane -R N
# DELETE
KEY_BIND + x                                        # Kill current pane (confirm)
exit                                                # Close pane (shell exit)
Ctrl + d                                            # Close pane (shell exit)
tmux kill-pane                                      # Kill pane
tmux kill-pane -t INDEX                             # Kill specific pane
# COPY MODE
KEY_BIND + [                                        # Enter copy mode
space                                               # Start selection
enter                                               # Copy selection
q or escape                                         # Exit
KEY_BIND + ]                                        # Paste Copied Text
# EXTRA
KEY_BIND + t                                        # Display a clock
KEY_BIND + ?                                        # List all tmux shortcuts
KEY_BIND + :                                        # Enter tmux command mode
```

| Command            | Description                                      | Example Usage            |
| ------------------ | ------------------------------------------------ | ------------------------ |
| ``       |                           |
