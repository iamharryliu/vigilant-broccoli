source $HOME/vigilant-broccoli/setup/dotfiles/common/aliases/aliases.sh

function ask() {
    echo -n "$1 (Y/n): "
    read resp
    if [ -z "$resp" ]; then
        response_lc="y" # empty is Yes
    else
        response_lc=$(echo "$resp" | tr '[:upper:]' '[:lower:]') # case insensitive
    fi

    [ "$response_lc" = "y" ]
}

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
    chmod -R +x "$HOME/shell-aliases/"
    chmod -R +x "$HOME/shell-scripts/"
    source ~/.zshrc
fi

if ask "Use default .env.sh?"; then
    cat $ZSH_DOTFILES_DIR/.env.sh >> ~/.env.sh
fi

if ask "Use default tmux.conf?"; then
    cat $DOTFILES_DIR/.tmux.conf >> ~/tmux.conf
fi

if ask "Use default tmux.conf?"; then
    cat $DOTFILES_DIR/.vimrc >> ~/.vimrc
fi

if ask "Install Node dependencies?"; then
    brew link node@20
    npm install -g ts-node
    npm install -g @angular/cli
    cd $REPO_DIR
    npm i -g recursive-install
    npm add --global nx@latest
    npm-recursive-install
fi


if ask "Setup git hooks?"; then
    cd $REPO_DIR
    pip3 install pre-commit && pre-commit install
    git config --unset-all core.hooksPath
fi


if ask "Setup macOS preferences?"; then
    chmod +x "$HOME/$MAC_SETUP_DIR/setup_macos_preferences.sh"
    . $HOME/$MAC_SETUP_DIR/setup_macos_preferences.sh
fi
