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
  vim.g.neovide_scale_factor = 1.0
  vim.g.neovide_padding_top = 0
  vim.g.neovide_padding_bottom = 0
  vim.g.neovide_padding_right = 0
  vim.g.neovide_padding_left = 0

  -- Copy
  vim.keymap.set({ "n", "v" }, "<D-c>", '"+y', { silent = true })

  -- Paste
  vim.keymap.set({ "n", "i" }, "<D-v>", '"+p', { silent = true })
  vim.keymap.set("c", "<D-v>", "<C-r>+", { silent = true })
end

vim.opt.clipboard = "unnamedplus"

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

require("lazy").setup("plugins")
