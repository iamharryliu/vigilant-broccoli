return {
  {
    "mason-org/mason.nvim",
    opts = {},
  },
  {
    "mason-org/mason-lspconfig.nvim",
    -- Must load after nvim-lspconfig, which registers vim.lsp.config() before auto-enable runs.
    dependencies = { "mason-org/mason.nvim", "neovim/nvim-lspconfig" },
    opts = {
      ensure_installed = {
        "ts_ls",
        "lua_ls",
        "pyright",
        "bashls",
        "jsonls",
        "yamlls",
        "terraformls",
        "marksman",
      },
    },
  },
  {
    "WhoIsSethDaniel/mason-tool-installer.nvim",
    dependencies = { "mason-org/mason.nvim" },
    opts = {
      ensure_installed = {
        "prettier",
        "stylua",
        "ruff",
        "shfmt",
        "shellcheck",
        "eslint_d",
        "tflint",
      },
    },
  },
}
