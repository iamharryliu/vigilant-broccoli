# tmux

## Setup and Quickstart

```
brew install tmux
tmux
```

## Features

### Server

Manages sessions, windows, and panes. Started automatically when tmux is launched and persists in the background as long as at least one session exists.

| Command             | Description                                       | Example Usage       |
| ------------------- | ------------------------------------------------- | ------------------- |
| `tmux start-server` | Start the tmux server explicitly (rarely needed). | `tmux start-server` |
| `tmux kill-server`  | Stop the tmux server and terminate all sessions.  | `tmux kill-server`  |

### Client

A client represents a terminal connected to a tmux session. A session can have multiple clients attached to it simultaneously.

| Command               | Description                     | Example Usage              |
| --------------------- | ------------------------------- | -------------------------- |
| `tmux list-clients`   | List all connected clients.     | `tmux list-clients`        |
| `tmux detach-client`  | Detach a client from a session. | `tmux detach-client`       |
| `tmux attach-session` | Attach a client to a session.   | `tmux attach-session -t 0` |

### Session

A top-level entity. Contains one or more windows and allows users to persist terminal states.

| Command               | Description                    | Example Usage                           |
| --------------------- | ------------------------------ | --------------------------------------- |
| `tmux new-session`    | Create a new session.          | `tmux new -s <session_name>`            |
| `tmux list-sessions`  | List all available sessions.   | `tmux ls`                               |
| `tmux attach-session` | Attach to an existing session. | `tmux attach-session -t <session_name>` |
| `tmux rename-session` | Rename a session.              | `tmux rename-session <session_name>`    |
| `tmux kill-session`   | Kill a specific session.       | `tmux kill-session -t <session_name>`   |

### Window

Similar to a tab. It exists within a session and contains one or more panes.

| Command              | Description                                   | Example Usage                  |
| -------------------- | --------------------------------------------- | ------------------------------ |
| `tmux new-window`    | Create a new window in the current session.   | `tmux new-window -n mywindow`  |
| `tmux list-windows`  | List all windows in the current session.      | `tmux list-windows`            |
| `tmux select-window` | Switch to a specific window by index or name. | `tmux select-window -t 2`      |
| `tmux rename-window` | Rename a window.                              | `tmux rename-window editor`    |
| `tmux kill-window`   | Kill a specific window.                       | `tmux kill-window -t mywindow` |

### Pane

A pane is a subdivision of a window, essentially a split terminal within the window.

| Command             | Description                                          | Example Usage            |
| ------------------- | ---------------------------------------------------- | ------------------------ |
| `tmux split-window` | Split the current pane (horizontally or vertically). | `tmux split-window -h`   |
| `tmux select-pane`  | Switch to a specific pane by direction or index.     | `tmux select-pane -L`    |
| `tmux resize-pane`  | Adjust the size of the current pane.                 | `tmux resize-pane -L 10` |
| `tmux kill-pane`    | Close a specific pane.                               | `tmux kill-pane`         |
| `tmux list-panes`   | List all panes in the current window.                | `tmux list-panes`        |

## Keyboard Shortcuts

| **Shortcut** | **Action**                          |
| ------------ | ----------------------------------- |
| `Ctrl-b ?`   | List all tmux shortcuts             |
| `Ctrl-b d`   | Detach from the current session     |
| `Ctrl-b c`   | Create a new window                 |
| `Ctrl-b n`   | Move to the next window             |
| `Ctrl-b p`   | Move to the previous window         |
| `Ctrl-b w`   | List all windows                    |
| `Ctrl-b ,`   | Rename the current window           |
| `Ctrl-b %`   | Split the current pane vertically   |
| `Ctrl-b "`   | Split the current pane horizontally |
| `Ctrl-b o`   | Switch to the next pane             |
| `Ctrl-b q`   | Show pane numbers                   |
| `Ctrl-b x`   | Close the current pane              |
| `Ctrl-b z`   | Toggle zoom for the current pane    |
| `Ctrl-b t`   | Display a clock                     |
| `Ctrl-b f`   | Find a window by name               |
| `Ctrl-b [`   | Enter copy mode                     |
| `Ctrl-b ]`   | Paste from the buffer               |
| `Ctrl-b &`   | Kill the current window             |
| `Ctrl-b s`   | List all sessions                   |
| `Ctrl-b :`   | Enter tmux command mode             |
