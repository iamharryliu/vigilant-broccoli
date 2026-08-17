return {
  {
    "nvim-treesitter/nvim-treesitter",
    branch = "main",
    lazy = false,
    build = ":TSUpdate",
    config = function()
      local parsers = {
        "typescript",
        "tsx",
        "javascript",
        "lua",
        "python",
        "bash",
        "json",
        "yaml",
        "hcl",
        "terraform",
        "markdown",
        "markdown_inline",
        "vim",
        "vimdoc",
        "query",
      }
      require("nvim-treesitter").install(parsers)

      local function try_attach(buf, language)
        if not vim.treesitter.language.add(language) then
          return
        end
        vim.treesitter.start(buf, language)
        if vim.treesitter.query.get(language, "indents") then
          vim.bo[buf].indentexpr = "v:lua.require'nvim-treesitter'.indentexpr()"
        end
      end

      local available = require("nvim-treesitter").get_available()
      vim.api.nvim_create_autocmd("FileType", {
        callback = function(args)
          local language = vim.treesitter.language.get_lang(args.match)
          if not language then
            return
          end

          local installed = require("nvim-treesitter").get_installed("parsers")
          if vim.tbl_contains(installed, language) then
            try_attach(args.buf, language)
          elseif vim.tbl_contains(available, language) then
            require("nvim-treesitter").install(language):await(function()
              try_attach(args.buf, language)
            end)
          else
            try_attach(args.buf, language)
          end
        end,
      })
    end,
  },
}
