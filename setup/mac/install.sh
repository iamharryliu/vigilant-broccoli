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

# Setup dotfiles.
if ask "Symlink dotfiles?"; then
    ln -s ~/$REPO_NAME/setup/dotfiles/.gitconfig ~/.gitconfig
    ln -s ~/$REPO_NAME/setup/dotfiles/zsh/.rc.zsh ~/.zshrc
    ln -s ~/$REPO_NAME/setup/dotfiles/zsh/.aliases.zsh ~/.zsh_aliases
    ln -s ~/$REPO_NAME/setup/dotfiles/zsh/aliases ~/shell-aliases
    chmod -R +x ~/shell-aliases/
    ln -s ~/$REPO_NAME/setup/dotfiles/zsh/scripts ~/shell-scripts
    chmod -R +x ~/shell-scripts/
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
