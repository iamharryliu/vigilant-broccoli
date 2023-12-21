/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
export PATH="/opt/homebrew/bin:$PATH" >> ~/.zshrc

brew install google-chrome
brew install spotify
brew install teamviewer

# General Dev Tools
brew install git
brew install visual-studio-code
brew install node
git clone git@github.com:iamharryliu/vigilant-broccoli.git
brew install pre-commit
brew install postman

# Web Dev Tools
npm install -g ts-node
npm install -g @angular/cli

# Database Dev Tools
brew install db-browser-for-sqlite

# Devops Tools
brew install docker
brew install virtualbox
brew install flyctl

# Communication
brew install whatsapp
brew install wechat
brew install discord

# Other
brew cask balenaetcher
brew install rekordbox
