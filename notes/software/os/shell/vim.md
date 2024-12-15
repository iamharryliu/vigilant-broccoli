# Vim

## Quickstart

```
brew install vim
sudo apt install vim

vim
vim [filename]
vimtutor
```

## Vscode Extension

[Look for installation section](https://github.com/VSCodeVim/Vim)

```
defaults write com.microsoft.VSCode ApplePressAndHoldEnabled -bool false
```

## Modes

Vim has 3 different modes

- **Normal Mode** - Used for navigation and operations (e.g., copying, pasting, deleting). This is the default mode when Vim starts.
- **Insert Mode** - Used for typing text, like a standard editor. Enter this mode by pressing **_i_**.
- **Command Mode** - Used for running commands (e.g., saving, quitting). Enter this mode by typing **_:_** in Normal mode.
- **Visual Mode** - For selecting text. Enter this mode by pressing **_v_**.

## Save and Quit

| Description         | Command |
| ------------------- | ------- |
| Quit.               | `:q`    |
| Force quit.         | `:q!`   |
| Save.               | `:w`    |
| Force save.         | `:w!`   |
| Save and quit.      | `:wq`   |
| Save and quit.      | `:x`    |
| Force save and quit | `:x!`   |

## Movement

| Description                                     | Command     |
| ----------------------------------------------- | ----------- |
| Move **left ←**.                                | `h`         |
| Move **down ↓**.                                | `j`         |
| Move **up ↑**.                                  | `k`         |
| Move **right →**.                               | `l`         |
| Jump to **line number**.                        | `:[number]` |
| Jump up **half the screen**.                    | `ctrl + u`  |
| Jump down **half the screen**.                  | `ctrl + d`  |
| Jump to the **start of the line**.              | `0`         |
| Jump to the **end of the line**.                | `$`         |
| Jump to the **beginning of the next word**.     | `w`         |
| Jump to the **end of the current/next word**.   | `e`         |
| Jump to the **previous word**.                  | `b`         |
| **Search forward** for _text_.                  | `/text`     |
| **Search backward** for _text_.                 | `?text`     |
| Jump to the **next match**.                     | `n`         |
| Jump to the **previous match**.                 | `N`         |
| Jump to the **first non-whitespace character**. | `^`         |
| Jump to the **top of the file**.                | `gg`        |
| Jump to the **end of the file**.                | `G`         |

### Insert Mode

| Description                               | Command |
| ----------------------------------------- | ------- |
| Insert mode **before cursor**.            | `i`     |
| Insert mode **after cursor**.             | `a`     |
| Insert mode at the **start of the line**. | `I`     |
| Insert mode at the **end of the line**.   | `A`     |

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
