# Install Brew and Git.
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install git
# Clone monorepo.
git clone git@github.com:iamharryliu/vigilant-broccoli.git
# Install Brew packages.
brew bundle --file ~/vigilant-broccoli/setup/Brewfile
# Setup dotfiles.
ln -s ~/vigilant-broccoli/setup/dotfiles/.gitconfig ~/.gitconfig
ln -s ~/vigilant-broccoli/setup/dotfiles/zsh/.rc.zsh ~/.zshrc
ln -s ~/vigilant-broccoli/setup/dotfiles/zsh/.aliases.zsh ~/.zsh_aliases
# Install Node packages.
npm install -g ts-node
npm install -g @angular/cli
