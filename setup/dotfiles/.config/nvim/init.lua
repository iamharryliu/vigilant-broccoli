vim.g.mapleader = " "

local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable",
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

if vim.g.neovide then
  vim.g.neovide_input_macos_option_key_is_meta = 'only_left'
  vim.g.neovide_remember_window_size = true
  vim.g.neovide_scale_factor = 1.0
  vim.g.neovide_padding_top = 0
  vim.g.neovide_padding_bottom = 0
  vim.g.neovide_padding_right = 0
  vim.g.neovide_padding_left = 0

  -- Copy
  vim.keymap.set({ "n", "v" }, "<D-c>", '"+y', { silent = true })

  -- Paste
  vim.keymap.set("n", "<D-v>", '"+p', { silent = true })
  vim.keymap.set("i", "<D-v>", "<C-r>+", { silent = true })
  vim.keymap.set("c", "<D-v>", "<C-r>+", { silent = true })
  vim.keymap.set("t", "<D-v>", [[<C-\><C-n>"+pi]], { silent = true })

  -- Save
  vim.keymap.set({ "n", "i" }, "<D-s>", "<cmd>write<CR>", { silent = true })
  vim.keymap.set("t", "<D-s>", function()
    vim.api.nvim_chan_send(vim.b.terminal_job_id, "\19")
  end, { silent = true })

  -- Close buffer
  vim.keymap.set("n", "<D-w>", "<cmd>bdelete<CR>", { silent = true })

  -- Undo/redo
  vim.keymap.set("n", "<D-z>", "u", { silent = true })
  vim.keymap.set("n", "<D-S-z>", "<C-r>", { silent = true })

  -- New tab
  vim.keymap.set("n", "<D-t>", "<cmd>tabnew<CR>", { silent = true })
end

-- Save (Ctrl-S), for every nvim instance including ones nested inside a terminal/tmux pane
vim.keymap.set({ "n", "i" }, "<C-s>", "<cmd>write<CR>", { silent = true })

vim.opt.clipboard = "unnamedplus"
vim.opt.mouse = "a"

vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.signcolumn = "yes"

vim.opt.tabstop = 2
vim.opt.shiftwidth = 2
vim.opt.expandtab = true

vim.opt.ignorecase = true
vim.opt.smartcase = true

vim.opt.undofile = true
vim.opt.scrolloff = 8

vim.api.nvim_create_autocmd("TermOpen", {
  callback = function()
    vim.opt_local.number = false
    vim.opt_local.relativenumber = false
    vim.opt_local.signcolumn = "no"
    vim.cmd('setlocal nospell')

    local opts = { buffer = 0 }
    vim.keymap.set('t', '<M-Left>', '<Esc>b', opts)
    vim.keymap.set('t', '<M-Right>', '<Esc>f', opts)
    vim.keymap.set('t', '<M-BS>', '<C-w>', opts)
  end,
})

-- Skip plugin loading under the config smoke test: it only exercises keymaps/options
-- set above, and doing this avoids installing the whole plugin set on a cold CI runner.
if not vim.env.NVIM_SMOKETEST then
  require("lazy").setup("plugins")
end
