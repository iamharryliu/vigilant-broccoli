source $HOME/vigilant-broccoli/setup/dotfiles/common/aliases/aliases.sh

if ask "Install Brew dependencies?"; then
    brewinit
fi

create_symlink() {
    local target=$1
    local link_name=$2

    if [ -L "$link_name" ]; then
        rm "$link_name"
        echo "Removed existing symlink $link_name"
    elif [ -e "$link_name" ]; then
        rm -rf "$link_name"
        echo "Removed existing file/directory $link_name"
    fi

    ln -s "$target" "$link_name"
    echo "Created symbolic link $link_name -> $target"
}

if ask "Symlink dotfiles?"; then
    create_symlink "$DOTFILES_DIR/.gitconfig" "$HOME/.gitconfig"
    create_symlink "$DOTFILES_DIR/macos" "$HOME/shell-macos"
    create_symlink "$ZSH_DOTFILES_DIR/.rc.zsh" "$HOME/.zshrc"
    create_symlink "$ZSH_DOTFILES_DIR/.aliases.mac.zsh" "$HOME/.zsh_aliases"
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

if ask "Change wallpaper?"; then
    chmod +x "$MAC_SETUP_DIR/change_wallpaper.sh"
    . $MAC_SETUP_DIR/change_wallpaper.sh
fi

if ask "Configure terminal theme?"; then
    p10k configure
fi

if ask "Setup vigilant-broccoli VSCode themes?"; then
    ln -s $HOME/vigilant-broccoli/vscode-themes ~/.vscode/extensions/vigilant-broccoli-vscode-themes
fi

if ask "Setup git hooks?"; then
    git config --unset-all core.hooksPath
    pip3 install pre-commit && pre-commit install
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
