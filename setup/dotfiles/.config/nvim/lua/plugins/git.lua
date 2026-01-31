return {
  {
    "sindrets/diffview.nvim",
    dependencies = { "nvim-lua/plenary.nvim" },
    config = function()
      require("diffview").setup({
        enhanced_diff_hl = true,
        view = {
          default = {
            layout = "diff2_horizontal",
          },
          merge_tool = {
            layout = "diff3_horizontal",
          },
        },
      })

      vim.api.nvim_create_user_command("GitDiff", function(opts)
        local args = opts.args
        if args == "" then
          vim.cmd("DiffviewOpen")
        else
          vim.cmd("DiffviewOpen " .. args)
        end
      end, { nargs = "*" })

      vim.api.nvim_create_user_command("GitDiffFile", function()
        vim.cmd("DiffviewFileHistory %")
      end, {})

      vim.api.nvim_create_user_command("GitDiffClose", function()
        vim.cmd("DiffviewClose")
      end, {})

      vim.keymap.set("n", "<leader>gd", ":GitDiff<CR>", { silent = true, desc = "Open Git diff" })
      vim.keymap.set("n", "<leader>gf", ":GitDiffFile<CR>", { silent = true, desc = "Git file history" })
      vim.keymap.set("n", "<leader>gc", ":GitDiffClose<CR>", { silent = true, desc = "Close Git diff" })
    end,
  },
  {
    "lewis6991/gitsigns.nvim",
    config = function()
      require("gitsigns").setup({
        signs = {
          add = { text = "+" },
          change = { text = "~" },
          delete = { text = "_" },
          topdelete = { text = "‾" },
          changedelete = { text = "~" },
        },
        on_attach = function(bufnr)
          local gs = package.loaded.gitsigns

          local function map(mode, l, r, opts)
            opts = opts or {}
            opts.buffer = bufnr
            vim.keymap.set(mode, l, r, opts)
          end

          map("n", "]c", function()
            if vim.wo.diff then return "]c" end
            vim.schedule(function() gs.next_hunk() end)
            return "<Ignore>"
          end, { expr = true, desc = "Next hunk" })

          map("n", "[c", function()
            if vim.wo.diff then return "[c" end
            vim.schedule(function() gs.prev_hunk() end)
            return "<Ignore>"
          end, { expr = true, desc = "Previous hunk" })

          map("n", "<leader>hs", gs.stage_hunk, { desc = "Stage hunk" })
          map("n", "<leader>hr", gs.reset_hunk, { desc = "Reset hunk" })
          map("n", "<leader>hp", gs.preview_hunk, { desc = "Preview hunk" })
          map("n", "<leader>hb", function() gs.blame_line({ full = true }) end, { desc = "Blame line" })
        end,
      })
    end,
  },
}
