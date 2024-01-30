# Install Brew packages.
brew bundle --file ~/vigilant-broccoli/setup/mac/Brewfile

# Setup dotfiles.
ln -s ~/vigilant-broccoli/setup/dotfiles/.gitconfig ~/.gitconfig
ln -s ~/vigilant-broccoli/setup/dotfiles/zsh/.rc.zsh ~/.zshrc
ln -s ~/vigilant-broccoli/setup/dotfiles/zsh/.aliases.zsh ~/.zsh_aliases

# Install Node packages.
npm install -g ts-node
npm install -g @angular/cli
