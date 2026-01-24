return {
  {
    "echasnovski/mini.animate",
    version = "*",
    lazy = false,
    priority = 1000,
    config = function()
      require("mini.animate").setup({
        cursor = {
          enable = true,
          timing = require("mini.animate").gen_timing.linear({ duration = 200, unit = "total" }),
          path = require("mini.animate").gen_path.line(),
        },
        scroll = {
          enable = true,
          timing = require("mini.animate").gen_timing.linear({ duration = 150, unit = "total" }),
        },
        resize = {
          enable = false,
        },
        open = {
          enable = false,
        },
        close = {
          enable = false,
        },
      })
    end,
  },
}
