source $HOME/vigilant-broccoli/setup/dotfiles/common/aliases/aliases.sh
source $HOME/vigilant-broccoli/setup/dotfiles/macos/aliases/aliases.sh
source $SETUP_DIR/common/symlinks.sh

if ask "Install Brew dependencies?"; then
    brewinit
fi

if ask "Symlink dotfiles?"; then
    symlink_common_dotfiles
    create_symlink "$DOTFILES_DIR/macos" "$HOME/shell-macos"
    create_symlink "$ZSH_DOTFILES_DIR/.rc.zsh" "$HOME/.zshrc"
    create_symlink "$ZSH_DOTFILES_DIR/.aliases.mac.zsh" "$HOME/.zsh_aliases"
    create_symlink "$WORKSPACES_DIR" "$HOME/Workspaces"
    source $HOME/.zshrc
fi


if ask "Setup macOS preferences?"; then
    chmod +x "$MAC_SETUP_DIR/setup_macos_preferences.sh"
    . $MAC_SETUP_DIR/setup_macos_preferences.sh
fi

if ask "Change wallpaper?"; then
    chmod +x "$MAC_SETUP_DIR/change_wallpaper.sh"
    . $MAC_SETUP_DIR/change_wallpaper.sh
fi

if ask "Setup Dock Stacks?"; then
    chmod +x "$MAC_SETUP_DIR/setup_dock_stacks.sh"
    . $MAC_SETUP_DIR/setup_dock_stacks.sh
fi

if ask "Configure terminal theme?"; then
    p10k configure
fi

if ask "Setup git hooks?"; then
    git config --unset-all core.hooksPath 2>/dev/null || true
    pre-commit install
fi

if ask "Install Node Packages?"; then
    npminit
fi

if ask "Generate local SSL certificates for *.vigilant-broccoli.app?"; then
    (cd "$HOME/vigilant-broccoli/infrastructure/local" && ./setup-certs.sh)
fi
