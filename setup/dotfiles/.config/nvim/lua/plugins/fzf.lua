return {
  {
    "junegunn/fzf",
    build = "./install --bin",
  },
  {
    "junegunn/fzf.vim",
    dependencies = { "junegunn/fzf" },
    config = function()
      vim.g.fzf_layout = { window = { width = 0.9, height = 0.6 } }

      vim.keymap.set("n", "<C-p>", ":Files<CR>", { desc = "FZF find files" })
      vim.keymap.set("n", "<C-g>", ":Rg<CR>", { desc = "FZF ripgrep search" })
      vim.keymap.set("n", "<C-b>", ":Buffers<CR>", { desc = "FZF buffers" })
    end,
  },
}
