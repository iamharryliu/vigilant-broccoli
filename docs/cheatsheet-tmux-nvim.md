# Cheatsheet — Tmux & Nvim

Keybindings for this repo's tmux + nvim setup (`setup/dotfiles/.tmux.conf`, `setup/dotfiles/.config/nvim/init.lua`). `PREFIX` = `ctrl + Space` (remapped from the tmux default `ctrl + b`).

```
🪟 TMUX — SESSIONS
  tmux new -s NAME                          Create new session
  tmux a -t NAME                            Attach to session
  PREFIX + d                                Detach from session
  PREFIX + S                                List sessions
  PREFIX + $                                Rename session

🧩 TMUX — WINDOWS
  PREFIX + c                                Create new window
  PREFIX + w                                List windows interactively
  PREFIX + n / p                            Next / previous window
  PREFIX + 0...9                            Jump to window by number
  PREFIX + ,                                Rename current window
  PREFIX + &                                Kill current window

▦  TMUX — PANES (custom)
  PREFIX + |                                Split pane side-by-side (in current path)
  PREFIX + -                                Split pane top/bottom (in current path)
  PREFIX + h/j/k/l                          Move focus left/down/up/right
  PREFIX + z                                Zoom/unzoom current pane
  PREFIX + o                                Cycle through all panes
  PREFIX + x                                Kill current pane (confirm)
  ctrl + d                                  Close pane (shell exit)
  (default " / % / PREFIX+Space are unbound — use |/- above instead)

📋 TMUX — COPY MODE & CLIPBOARD
  PREFIX + [                                Enter copy mode
  space                                     Start selection
  y                                         Copy selection to system clipboard, exit copy mode
  PREFIX + p                                Paste last copied content into pane (macOS only)
  (OSC 52 everywhere; pbcopy/pbpaste bindings only added when macOS pbcopy is present —
   on Linux, PREFIX+p stays tmux's default "previous window")

🔗 TMUX — TMUXVB WORKFLOW
  tmuxvb                                    Create/attach the "vb" session (2 windows: neovim, vb)
  neovidetmuxvb                             Launch Neovide, auto-attach to "vb" via :terminal
  (window 1 "neovim": Neovide's nested nvim `:terminal tmux attach -t vb`)
  (window 2 "vb": 2 panes in repo root — one free, one running `claude`)

✏️  NVIM — CORE
  <leader>                                  Space (vim.g.mapleader = " ")
  u                                         Undo
  ctrl + r                                  Redo
  ctrl + s                                  Save (works in any nvim instance, incl. nested)

🌳 NVIM — NVIMTREE
  :NvimTreeToggle                           Open/close the tree
  :NvimTreeFindFile                         Open tree, highlight current buffer file
  j / k                                     Move cursor up/down
  h / l                                     Close folder (or go to parent) / open folder or file
  Enter or o                                Open file or toggle folder
  v / s / t                                 Open file in vsplit / split / new tab
  a / r / d                                 Create / rename / delete file
  c / x / p                                 Copy / cut / paste file

📁 NVIM — OIL.NVIM
  -                                         Open parent directory
  <CR>                                      Open file or directory
  <C-v> / <C-s>                             Open in vertical / horizontal split
  g.                                        Toggle hidden files

🔭 NVIM — TELESCOPE
  <leader>ff                                Find files
  <leader>fg                                Live grep
  <leader>fb                                Find buffers
  <leader>fw                                Find word under cursor
  <CR> / <C-x> / <C-v> / <C-t>              Open file / hsplit / vsplit / new tab

🧠 NVIM — LSP
  gd / gD / gr / gI                         Go to definition / declaration / references / implementation
  K                                         Hover documentation
  <leader>rn                                Rename symbol
  <leader>ca                                Code action
  [d / ]d                                   Previous/next diagnostic
  <leader>e                                 Show diagnostic under cursor

✅ NVIM — COMPLETION
  <C-Space>                                 Trigger completion
  <C-n> / <C-p>                             Next / previous item
  <CR>                                      Confirm selected item
  <C-e>                                     Abort completion

🎨 NVIM — FORMAT & LINT
  <leader>lf                                Format buffer (also runs on save)
  (linting runs automatically on save, buffer enter, leaving insert mode)

🔍 NVIM — FZF
  <C-p>                                     Find files
  <C-g>                                     Ripgrep search in files
  <C-b>                                     Search buffers

🔀 NVIM — GIT DIFF / GITSIGNS
  <leader>gd / gf / gc                      Open / show history for / close Git diff
  ]c / [c                                   Jump to next / previous hunk
  <leader>hs / hr / hp / hb                 Stage / reset / preview hunk / show line blame

⌨️  NVIM — TERMINAL BUFFER (any :terminal)
  i                                         Enter Terminal-Insert mode
  <C-\><C-n>                                Exit Terminal-Insert mode, back to Normal
  alt + Left / Right                        Move back/forward a word
  alt + Backspace                           Delete previous word
  :bd!                                      Force kill terminal buffer from Normal mode

🖥️  NEOVIDE — CMD-KEY MAPPINGS (GUI only, vim.g.neovide gate)
  cmd + c                                   Copy (normal/visual mode)
  cmd + v                                   Paste (normal/insert/cmdline/terminal-insert)
  cmd + s                                   Save — the only one forwarded into a :terminal
                                             (sends raw Ctrl-S down the pty to a nested nvim)
  cmd + w                                   Close buffer (:bdelete)
  cmd + z / cmd + shift + z                 Undo / redo
  cmd + t                                   New tab (:tabnew)
  (w/z/shift+z/t are NOT forwarded into :terminal — use the native nvim keys above once nested;
   forwarding Ctrl-Z there would trigger vim's own "suspend" instead of undo)
```
