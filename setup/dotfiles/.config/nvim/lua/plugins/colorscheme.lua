return {
  {
    "catppuccin/nvim",
    name = "catppuccin",
    priority = 1000,
    config = function()
      require("catppuccin").setup({
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
      })

      local function set_background_from_system()
        local handle = io.popen("defaults read -g AppleInterfaceStyle 2>/dev/null")
        local result = handle:read("*a")
        handle:close()

        if result:match("Dark") then
          vim.o.background = "dark"
        else
          vim.o.background = "light"
        end
      end

      set_background_from_system()
      vim.cmd.colorscheme("catppuccin")
    end,
  },
}
