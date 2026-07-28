# nvim/neovide Setup Review (2026-07-28)

Suggestions from a review of `setup/dotfiles/.config/nvim/` and the neovide aliases/scripts. Not yet actioned — revisit and pick items to implement.

## Gaps

- No LSP, completion engine, treesitter, or formatter/linter plugin anywhere. Syntax highlighting is default-vim regex-based; no diagnostics, go-to-definition, hover, or autocomplete. Biggest win if this is meant to be a daily coding driver.
- `vim.g.mapleader` is never set, so leader stays the default `\` even though `<leader>ff/fg/fb/...`, `<leader>gd/gf/gc`, `<leader>hs/hr/hp/hb` all depend on it. Set `vim.g.mapleader = " "` at the top of `init.lua`, before `lazy.setup`.
- No base options file (`vim.opt.number`, `relativenumber`, `tabstop`/`shiftwidth`/`expandtab`, `ignorecase`/`smartcase`, `undofile`, `scrolloff`, `signcolumn`, etc.). The `TermOpen` autocmd explicitly turns `number`/`relativenumber` off for terminal buffers, implying they're expected on elsewhere, but nothing turns them on.

## Redundant plugins

- `fzf.vim` + `telescope.nvim`/`telescope-fzf-native.nvim` both function as full fuzzy finders (`<C-p>` → fzf.vim `Files`, `<leader>ff` → telescope `find_files`). Telescope with the native fzf sorter covers everything fzf.vim does; likely safe to drop `junegunn/fzf` + `fzf.vim` and simplify.
- `nvim-tree.lua` + `oil.nvim` overlap as file explorers. Not necessarily a problem (sidebar tree vs. buffer-based directory editor is a common pairing, and oil is already set as non-default), but worth confirming both still earn their keep.

## Neovide-specific

- Only `<D-c>`/`<D-v>` are mapped. Common additions: `<D-s>` save, `<D-w>` close buffer, `<D-z>`/`<D-S-z>` undo/redo, `<D-t>` new tab.
- `mini.animate` cursor animation may visually clash with neovide's own cursor vfx (`neovide_cursor_vfx_mode`) if that's ever enabled — worth checking they don't fight.
- `neovide_remember_window_size` isn't set; could be nice for persisting window geometry.

## Portability (Linux vs. macOS)

- `neovide` is listed in `setup/mac/Brewfile` but not in `setup/linux/apt-packages.txt` (only `neovim` is). The `neovideterminal`/`neovidetmuxvb` aliases are shared (not mac-only), so they'd fail on a fresh Linux box until neovide is installed manually.
- `vim.opt.clipboard = "unnamedplus"` is set unconditionally, but no `xclip`/`xsel`/`wl-clipboard` is in `apt-packages.txt`. Likely fine inside neovide (it handles clipboard itself), but plain-terminal `nvim` on Linux will silently fail to sync with the system clipboard (`:checkhealth` will flag it).
