return {
  {
    "stevearc/conform.nvim",
    config = function()
      require("conform").setup({
        formatters_by_ft = {
          typescript = { "prettier" },
          typescriptreact = { "prettier" },
          javascript = { "prettier" },
          json = { "prettier" },
          yaml = { "prettier" },
          markdown = { "prettier" },
          lua = { "stylua" },
          python = { "ruff_format" },
          sh = { "shfmt" },
          terraform = { "terraform_fmt" },
        },
        format_on_save = {
          timeout_ms = 1000,
          lsp_fallback = true,
        },
      })

      vim.keymap.set({ "n", "v" }, "<leader>lf", function()
        require("conform").format({ async = true, lsp_fallback = true })
      end, { desc = "Format buffer" })
    end,
  },
}
