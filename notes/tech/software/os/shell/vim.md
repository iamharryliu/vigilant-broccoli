# Vim

- Vim has 3 different modes
- **Normal Mode** - Used for navigation and operations (e.g., copying, pasting, deleting). This is the default mode when Vim starts.
- **Insert Mode** - Used for typing text, like a standard editor. Enter this mode by pressing **_i_**.
- **Command Mode** - Used for running commands (e.g., saving, quitting). Enter this mode by typing **_:_** in Normal mode.
- **Visual Mode** - For selecting text. Enter this mode by pressing **_v_**.

```
brew install vim
sudo apt install vim

vim
vim [filename]
vimtutor

# INSERT MODE
i                                           # Insert mode before cursor
a                                           # Insert mode after cursor
I                                           # Insert mode at the start of the line
A                                           # Insert mode at the end of the line

# NAVIGATION
# PAGE NAVIGATION
hjkl                                        # Left, down, up, right
:LINE_NUMBER                                # Jump to line number
ctrl + u                                    # Jump up half the screen
ctrl + d                                    # Jump down half the screen
gg                                          # Jump to top of file
G                                           # Jump to end of file
# LINE NAVIGATION
0                                           # Jump to start of line
$                                           # Jump to end of line
w                                           # Jump to beginning of next word
e                                           # Jump to end of current/next word
b                                           # Jump to previous word


# EXIT
:q                                          # Quit
:q!                                         # Force quit
:w                                          # Save
:w!                                         # Force save
:wq!                                        # Save and quit
:x                                          # Save and quit
:x!                                         # Force save and quit
```

## Movement

| Description                                     | Command |
| ----------------------------------------------- | ------- |
| **Search forward** for _text_.                  | `/text` |
| **Search backward** for _text_.                 | `?text` |
| Jump to the **next match**.                     | `n`     |
| Jump to the **previous match**.                 | `N`     |
| Jump to the **first non-whitespace character**. | `^`     |

## Delete / Undo

| Description                   | Command    |
| ----------------------------- | ---------- |
| **Delete character**          | `x`        |
| **Delete line.**              | `dd`       |
| **Delete _n_ lines.**         | `[n]dd`    |
| Normal mode **undo change**.  | `u`        |
| Normal mode **redo change**.  | `ctrl + r` |
| Command mode **undo change**. | `:undo`    |
| Command mode **redo change**. | `:redo`    |

## Copy and Paste

| Description             | Command |
| ----------------------- | ------- |
| **Copy the line.**      | `yy`    |
| **Paste below** cursor. | `p`     |
| **Paste above** cursor. | `P`     |

## Replace

| Description                                      | Command          |
| ------------------------------------------------ | ---------------- |
| **Replace all occurrences** of _old_ with _new_. | `:%s/old/new/g`  |
| **Replace all occurrences** with confirmation.   | `:%s/old/new/gc` |

## Visual Commands

| Description               | Command       |
| ------------------------- | ------------- |
| Adds **line numbers**.    | :set number   |
| Removes **line numbers**. | :set nonumber |

### Window

| Description             | Command |
| ----------------------- | ------- |
| Split **horizontally**. | `:sp`   |
| Split **vertically**.   | `:vsp`  |

## Other Commands

| Description                    | Command     |
| ------------------------------ | ----------- |
| Help documentation.            | `:help`     |
| Run shell command (ie `!pwd`). | `:!command` |

## Vscode Extension

[Look for installation section](https://github.com/VSCodeVim/Vim)

```
defaults write com.microsoft.VSCode ApplePressAndHoldEnabled -bool false
```
