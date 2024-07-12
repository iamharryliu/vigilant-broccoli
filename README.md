# vigilant-broccoli

## About

vigilant-broccoli, my personal open source development kit and monorepo.

<img src="https://i.pinimg.com/564x/b7/62/38/b762386c0bbb20dec77c2632f73d28a8.jpg" alt="broccoli" width="200"/>

## Machine Setup

### Mac

RSA Setup

```
ssh-keygen -b 4096 -t rsa
```

Install Brew and Git.

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
export PATH="/opt/homebrew/bin:$PATH" >> ~/.zshrc
brew install git

Clone monorepo and run install script.
```

cd ~ && git clone git@github.com:iamharryliu/vigilant-broccoli.git
chmod +x ~/vigilant-broccoli/setup/mac/install.sh
~/vigilant-broccoli/setup/mac/install.sh

```

## Folder Structure

- setup - Setup scripts and configurations.
- notes
- projects
- scripts
- snippets
```
