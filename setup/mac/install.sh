# Install Brew dependencies.
brew bundle --file ~/vigilant-broccoli/setup/mac/Brewfile

# Setup dotfiles.
ln -s ~/vigilant-broccoli/setup/dotfiles/.gitconfig ~/.gitconfig
ln -s ~/vigilant-broccoli/setup/dotfiles/zsh/.rc.zsh ~/.zshrc
ln -s ~/vigilant-broccoli/setup/dotfiles/zsh/.aliases.zsh ~/.zsh_aliases

# Install Node dependencies.
npm install -g ts-node
npm install -g @angular/cli
cd ~/vigilant-broccoli
npm i -g recursive-install
npm-recursive-install

# Install Python dependencies.
pip3 install pre-commit && pre-commit install
