# nvim

- Default `<leader>` is `\`

```
u                                           # Undo
ctrl + r                                    # Redo
```

## NvimTree

```
neovide

:NvimTreeToggle                             # Open or close the tree
:NvimTreeFocus                              # Move cursor to the tree without closing it
:NvimTreeFindFile                           # Open tree and highlight current buffer file
:NvimTreeCollapse                           # Recursively collapse all open folders
:NvimTreeRefresh                            # Manually refresh the file list

j / k                                       # Move cursor up and down
h                                           # Close current folder / Go to parent folder
l                                           # Open folder / Open file
Enter or o                                  # Open file or toggle folder expansion
v                                           # Open file in a vertical split
s                                           # Open file in a horizontal split
t                                           # Open file in a new tab
P                                           # Move cursor to parent folder
K                                           # Navigate to the first sibling of current node
J                                           # Navigate to the last sibling of current node
```

## Oil.nvim

```
-                                           # Open parent directory
<CR>                                        # Open file or directory
<C-v>                                       # Open in vertical split
<C-s>                                       # Open in horizontal split
<C-p>                                       # Preview file
<C-c>                                       # Close oil
g.                                          # Toggle hidden files
gs                                          # Change sort order
```

## Telescope

```
<leader>ff                                  # Find files
<leader>fg                                  # Live grep (search in files)
<leader>fb                                  # Find buffers
<leader>fh                                  # Search help tags
<leader>fr                                  # Recent files
<leader>fw                                  # Find word under cursor

<C-h>                                       # Show help (in telescope prompt)
<C-n>/<C-p>                                 # Next/previous item
<CR>                                        # Open file
<C-x>                                       # Open in horizontal split
<C-v>                                       # Open in vertical split
<C-t>                                       # Open in new tab
```

## FZF

```
<C-p>                                       # Find files
<C-g>                                       # Ripgrep search in files
<C-b>                                       # Search buffers

<C-n>/<C-p>                                 # Next/previous item
<CR>                                        # Open file
<C-x>                                       # Open in horizontal split
<C-v>                                       # Open in vertical split
<C-t>                                       # Open in new tab
```

# Neovide

```
neovide -- -c "terminal" -c "startinsert"   # Start Neovide as a dedicated terminal
neovide -- -c "vsplit +term"                # Start with editor and terminal side-by-side


# --- OPENING INSIDE NEOVIDE (NORMAL MODE) ---
:term                                       # Open terminal in current window
:split +term                                # Open terminal in horizontal split
:vsplit +term                               # Open terminal in vertical split
:tabedit +term                              # Open terminal in a new tab


# --- NAVIGATION & MODES ---
i                                           # Enter Terminal-Insert mode (to type)
<C-\><C-n>                                  # Exit Terminal-Insert mode (back to Normal mode)
exit                                        # Close the shell and the buffer
:bd!                                        # Force kill terminal buffer from Normal mode
```

# Git Diff

```
# Diffview & Vim Pane Commands

# --- Diffview commands ---
:GitDiff                 # Open Git diff view for the repo
:GitDiff <file/branch>   # Open diff for a specific file or branch
:GitDiffFile             # Show Git file history of current file
:GitDiffClose            # Close the diffview

# --- Pane / Window navigation ---
Ctrl-w h                 # Move to the window to the left
Ctrl-w j                 # Move to the window below
Ctrl-w k                 # Move to the window above
Ctrl-w l                 # Move to the window to the right
Ctrl-w w                 # Cycle to the next window

# --- Pane resizing ---
Ctrl-w >                 # Increase pane width
Ctrl-w <                 # Decrease pane width
Ctrl-w +                 # Increase pane height
Ctrl-w -                 # Decrease pane height

# --- Making panes editable (if needed) ---
:setlocal modifiable      # Make current pane editable
vim.api.nvim_buf_set_option(0, "modifiable", true)  # Lua equivalent

# --- Gitsigns commands (on current buffer) ---
]c                       # Jump to next hunk
[c                       # Jump to previous hunk
<leader>hs               # Stage current hunk
<leader>hr               # Reset current hunk
<leader>hp               # Preview current hunk
<leader>hb               # Show full blame for current line

# --- Leader key ---
<leader>                 # Prefix key for custom shortcuts (default \, commonly set to Space)
<leader>gd               # Open Git diff (maps to :GitDiff)
<leader>gf               # Show file history (maps to :GitDiffFile)
<leader>gc               # Close Git diff (maps to :GitDiffClose)

```
