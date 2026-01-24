source $HOME/vigilant-broccoli/setup/dotfiles/common/aliases/aliases.sh

if ask "Install Brew dependencies?"; then
    brewinit
fi

create_symlink() {
    local target=$1
    local link_name=$2

    if [ -L "$link_name" ]; then
        echo "Symbolic link $link_name already exists."
        return 0
    elif [ -e "$link_name" ]; then
        echo "File $link_name already exists but is not a symbolic link."
        rm -rf "$target"
        echo "Removed existing file or symlink at $target"
    fi

    ln -s "$target" "$link_name"
    echo "Created symbolic link $link_name -> $target"
}

if ask "Symlink dotfiles?"; then
    create_symlink "$DOTFILES_DIR/.gitconfig" "$HOME/.gitconfig"
    create_symlink "$COMMON_DOTFILES_DIR" "$HOME/shell-common"
    create_symlink "$ZSH_DOTFILES_DIR/.rc.zsh" "$HOME/.zshrc"
    create_symlink "$ZSH_DOTFILES_DIR/.aliases.zsh" "$HOME/.zsh_aliases"
    create_symlink "$ZSH_DOTFILES_DIR/aliases" "$HOME/shell-aliases"
    create_symlink "$ZSH_DOTFILES_DIR/scripts" "$HOME/shell-scripts"
    create_symlink "$DOTFILES_DIR/.tmux.conf" "$HOME/.tmux.conf"
    create_symlink "$DOTFILES_DIR/.vimrc" "$HOME/.vimrc"
    mkdir -p "$HOME/.config"
    create_symlink "$DOTFILES_DIR/.config/nvim" "$HOME/.config/nvim"
    create_symlink "$CLAUDE_COMMANDS_DIR" "$HOME/.claude/commands"
    chmod -R +x "$HOME/shell-aliases/"
    chmod -R +x "$HOME/shell-scripts/"
    source $HOME/.zshrc
fi


if ask "Setup macOS preferences?"; then
    chmod +x "$MAC_SETUP_DIR/setup_macos_preferences.sh"
    . $MAC_SETUP_DIR/setup_macos_preferences.sh
fi

if ask "Add wallpaper?"; then
    WALLPAPER_PATH="$HOME/vigilant-broccoli/wallpapers/ducky.jpg"
    osascript -e "tell application \"System Events\" to set picture of every desktop to \"$WALLPAPER_PATH\""
fi

if ask "Configure terminal theme?"; then
    p10k configure
fi

if ask "Setup vigilant-broccoli VSCode themes?"; then
    ln -s $HOME/vigilant-broccoli/vscode-themes ~/.vscode/extensions/vigilant-broccoli-vscode-themes
fi

if ask "Setup git hooks?"; then
    pip3 install pre-commit && pre-commit install
    git config --unset-all core.hooksPath
fi

if ask "Install Node Packages?"; then
    brew link node@20
    npm install -g yarn
    npm install -g ts-node
    npm install -g tsx
    npm install -g @angular/cli
    npm add --global nx@latest
fi

if ask "Install Python packages?"; then
    pip3 install codespell
fi
