REPO_NAME="vigilant-broccoli"

function ask() {
    read -p "$1 (Y/n): " resp
    if [ -z "$resp" ]; then
        response_lc="y" # empty is Yes
    else
        response_lc=$(echo "$resp" | tr '[:upper:]' '[:lower:]') # case insensitive
    fi

    [ "$response_lc" = "y" ]
}

# Install Brew dependencies.
if ask "Install Brew dependencies?"; then
    brew bundle --file ~/$REPO_NAME/setup/mac/Brewfile
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
    create_symlink "$REPO_PATH/.gitconfig" "$HOME/.gitconfig"
    create_symlink "$REPO_PATH/zsh/.rc.zsh" "$HOME/.zshrc"
    create_symlink "$REPO_PATH/zsh/.aliases.zsh" "$HOME/.zsh_aliases"
    create_symlink "$REPO_PATH/zsh/aliases" "$HOME/shell-aliases"
    chmod -R +x "$HOME/shell-aliases/"
    create_symlink "$REPO_PATH/zsh/scripts" "$HOME/shell-scripts"
    chmod -R +x "$HOME/shell-scripts/"

fi

if ask "Use default .env.sh?"; then
    cat ~/$REPO_NAME/setup/dotfiles/zsh/.env.sh >> ~/.env.sh
fi

if ask "Install Node dependencies?"; then
    brew link node@20
    npm install -g ts-node
    npm install -g @angular/cli
    cd ~/$REPO_NAME
    npm i -g recursive-install
    npm-recursive-install
fi


if ask "Install Python dependencies?"; then
    pip3 install pre-commit && pre-commit install
fi


if ask "Setup macOS Dock?"; then
    dockutil --add "/Applications/Mail.app"
    dockutil --add "/Applications/Google Chrome.app"
    dockutil --add "/Applications/Mail.app"
    dockutil --add "/Applications/Visual Studio Code.app"
    dockutil --add "/Applications/Obsidian.app"
    dockutil --add "/Applications/Messages.app"
    dockutil --add "/Applications/FaceTime.app"
    dockutil --add "/Applications/WhatsApp.app"
    dockutil --add "/Applications/Slack.app"
    dockutil --add "/Applications/Spotify.app"
    dockutil --add "/Applications/NordVPN.app"
    defaults write com.apple.dock autohide -bool true
    killall Dock
fi
