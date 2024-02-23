# vigilant-broccoli

## About

vigilant-broccoli is my personal mono-repo that I use to house all the code (or most) that I am working on and documentation.

## Machine Setup

### Mac

```
# Install Brew and Git.
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
export PATH="/opt/homebrew/bin:$PATH" >> ~/.zshrc
brew install git
```

```
# Clone monorepo and run install script.
cd ~ && git clone git@github.com:iamharryliu/vigilant-broccoli.git
chmod +x ~/vigilant-broccoli/setup/mac/install.sh
~/vigilant-broccoli/setup/mac/install.sh
```

## Commands

### General

```
npm run install-all
```

## Notes

- [Dance](notes/dance/)
- [Language Learning](notes/language-learning/)
- [Web Development](notes/software/web-dev/)
