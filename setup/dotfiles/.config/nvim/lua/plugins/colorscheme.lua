return {
  {
    "catppuccin/nvim",
    name = "catppuccin",
    priority = 1000,
    opts = {
      flavour = "auto",
      background = {
        light = "latte",
        dark = "mocha",
      },
      integrations = {
        nvimtree = true,
        telescope = true,
        gitsigns = true,
        mini = {
          enabled = true,
        },
      },
    },
    config = function(_, opts)
      require("catppuccin").setup(opts)
      vim.cmd.colorscheme("catppuccin")
    end,
  },
  {
    "cormacrelf/dark-notify",
    config = function()
      require("dark_notify").run({
        schemes = {
          dark = {
            colorscheme = "catppuccin",
            background = "dark",
          },
          light = {
            colorscheme = "catppuccin",
            background = "light",
          },
        },
        onchange = function(mode)
          vim.o.background = mode
          vim.cmd.colorscheme("catppuccin")
        end,
      })
    end,
  },
}
