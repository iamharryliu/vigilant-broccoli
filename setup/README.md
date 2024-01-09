# New Machine Setup

```
# Install Brew and Git.
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
export PATH="/opt/homebrew/bin:$PATH" >> ~/.zshrc
brew install git

# Clone monorepo and run install script.
cd ~ && git clone git@github.com:iamharryliu/vigilant-broccoli.git
chmod +x ~/vigilant-broccoli/setup/install.sh
~/vigilant-broccoli/setup/install.sh

cd ~/vigilant-broccoli
npm i -g recursive-install
npm-recursive-install
pip3 install pre-commit && pre-commit install
```
