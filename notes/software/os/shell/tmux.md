# tmux

## Setup

```
brew install tmux
```

## Commands

```
tmux
tmux ls
tmux attach-session -t <session-name>
tmux kill-session -t <session-name>
```

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
