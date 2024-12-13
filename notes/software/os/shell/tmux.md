# tmux

## Setup and Quickstart

```
brew install tmux
tmux
```

## Features

### Server

Manages sessions, windows, and panes. Started automatically when tmux is launched and persists in the background as long as at least one session exists.

| Command             |
| ------------------- |
| `tmux start-server` |
| `tmux kill-server`  |

### Client

A client represents a terminal connected to a tmux session. A session can have multiple clients attached to it simultaneously.

| Command              | Description                     |
| -------------------- | ------------------------------- |
| `tmux list-clients`  | List all connected clients.     |
| `tmux detach-client` | Detach a client from a session. |

### Session

A top-level entity. Contains one or more windows and allows users to persist terminal states.

| Command                                            | Description                    |
| -------------------------------------------------- | ------------------------------ |
| `tmux new-session` or `tmux new -s <session_name>` | Create a new session.          |
| `tmux ls`                                          | List all available sessions.   |
| `tmux attach-session -t <session_name>`            | Attach to an existing session. |
| `tmux rename-session <session_name>`               | Rename a session.              |
| `tmux kill-session -t <session_name>`              | Kill a specific session.       |

_Keyboard Shortcuts_

| **Shortcut** | **Action**                      |
| ------------ | ------------------------------- |
| `prefix + s` | List all sessions               |
| `prefix + d` | Detach from the current session |

### Window

Similar to a tab. It exists within a session and contains one or more panes.

| Command                          | Description                                   |
| -------------------------------- | --------------------------------------------- |
| `tmux new-window -n mywindow`    | Create a new window in the current session.   |
| `tmux list-windows`              | List all windows in the current session.      |
| `tmux select-window -t <window>` | Switch to a specific window by index or name. |
| `tmux rename-window <name>`      | Rename a window.                              |
| `tmux kill-window -t <window>`   | Kill a specific window.                       |

_Keyboard Shortcuts_

| **Shortcut**   | **Action**                  |
| -------------- | --------------------------- |
| `prefix + c`   | Create a new window         |
| `prefix + w`   | List all windows            |
| `prefix + n`   | Move to the next window     |
| `prefix + p`   | Move to the previous window |
| `prefix + _n_` | Move to the _n_ window      |
| `prefix + f`   | Find a window by name       |
| `prefix + ,`   | Rename the current window   |
| `prefix + &`   | Kill the current window     |

### Pane

A pane is a subdivision of a window, essentially a split terminal within the window.

| Command             | Description                                          | Example Usage            |
| ------------------- | ---------------------------------------------------- | ------------------------ |
| `tmux split-window` | Split the current pane (horizontally or vertically). | `tmux split-window -h`   |
| `tmux select-pane`  | Switch to a specific pane by direction or index.     | `tmux select-pane -L`    |
| `tmux resize-pane`  | Adjust the size of the current pane.                 | `tmux resize-pane -L 10` |
| `tmux kill-pane`    | Close a specific pane.                               | `tmux kill-pane`         |
| `tmux list-panes`   | List all panes in the current window.                | `tmux list-panes`        |

_Keyboard Shortcuts_

| **Shortcut** | **Action**                          |
| ------------ | ----------------------------------- |
| `prefix + %` | Split the current pane vertically   |
| `prefix + "` | Split the current pane horizontally |
| `prefix + o` | Switch to the next pane             |
| `prefix + q` | Show pane numbers                   |
| `prefix + x` | Close the current pane              |
| `prefix + z` | Full screen pane.                   |

## More Shortcuts

| **Shortcut** | **Action**              |
| ------------ | ----------------------- |
| `prefix + ?` | List all tmux shortcuts |
| `prefix + t` | Display a clock         |
| `prefix + [` | Enter copy mode         |
| `prefix + ]` | Paste from the buffer   |
| `prefix + :` | Enter tmux command mode |
