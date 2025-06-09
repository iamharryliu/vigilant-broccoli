source $HOME/vigilant-broccoli/setup/dotfiles/common/aliases/aliases.sh

# Install Brew dependencies.
if ask "Install Brew dependencies?"; then
    brewinit
fi

create_symlink() {
    local target=$1
    local link_name=$2

    if [ -L "$link_name" ]; then
        echo "Symbolic link $link_name already exists."
    elif [ -e "$link_name" ]; then
        echo "File $link_name already exists but is not a symbolic link."
    else
        ln -s "$target" "$link_name"
        echo "Created symbolic link $link_name -> $target"
    fi
}

# Setup dotfiles.
if ask "Symlink dotfiles?"; then
    create_symlink "$DOTFILES_DIR/.gitconfig" "$HOME/.gitconfig"
    create_symlink "$COMMON_DOTFILES_DIR" "$HOME/shell-common"
    create_symlink "$ZSH_DOTFILES_DIR/.rc.zsh" "$HOME/.zshrc"
    create_symlink "$ZSH_DOTFILES_DIR/.aliases.zsh" "$HOME/.zsh_aliases"
    create_symlink "$ZSH_DOTFILES_DIR/aliases" "$HOME/shell-aliases"
    create_symlink "$ZSH_DOTFILES_DIR/scripts" "$HOME/shell-scripts"
    create_symlink "$DOTFILES_DIR/.tmux.conf" "$HOME/.tmux.conf"
    create_symlink "$DOTFILES_DIR/.vimrc" "$HOME/.vimrc"
    chmod -R +x "$HOME/shell-aliases/"
    chmod -R +x "$HOME/shell-scripts/"
    source $HOME/.zshrc
fi

if ask "Use default .env.sh?"; then
    cat $ZSH_DOTFILES_DIR/.env.sh >> ~/.env.sh
fi

if ask "Install Node dependencies?"; then
    brew link node@20
    npm install -g yarn
    npm install -g ts-node
    npm install -g tsx
    npm install -g @angular/cli
    npm add --global nx@latest
    # TODO: think about this
    # npm-recursive-install
    # npm i -g recursive-install
fi

if ask "Setup git hooks?"; then
    pip3 install pre-commit && pre-commit install
    git config --unset-all core.hooksPath
fi

if ask "Setup macOS preferences?"; then
    chmod +x "$HOME/$MAC_SETUP_DIR/setup_macos_preferences.sh"
    . $HOME/$MAC_SETUP_DIR/setup_macos_preferences.sh
fi

if ask "Add wallpaper?"; then
    WALLPAPER_PATH="$HOME/vigilant-broccoli/wallpapers/ducky.jpg"
    osascript -e "tell application \"System Events\" to set picture of every desktop to \"$WALLPAPER_PATH\""
fi

if ask "Configure terminal theme?"; then
    p10k configure
fi
