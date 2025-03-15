# vigilant-broccoli

## About

vigilant-broccoli, my personal open source development kit and monorepo.

<img src="https://i.pinimg.com/564x/b7/62/38/b762386c0bbb20dec77c2632f73d28a8.jpg" alt="broccoli" width="200"/>

## Machine Setup

### Macbook Pro (MBP)

Install Brew and Git.

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
export PATH="/opt/homebrew/bin:$PATH" >> ~/.zshrc
brew install git
```

Setup RSA key.

```
ssh-keygen -b 4096 -t rsa
cat .ssh/id_rsa.pub| pbcopy
```

Clone monorepo and run install script.

```
cd ~ && git clone https://github.com/iamharryliu/vigilant-broccoli.git
cd ~ && git clone git@github.com:iamharryliu/vigilant-broccoli.git
chmod +x ~/vigilant-broccoli/setup/mac/install.sh
~/vigilant-broccoli/setup/mac/install.sh
```

## Folder Structure

- notes - Collection of markdown notes.
- projects - Software projects.
  - Nx workspace for Typescript projects
  - Demo/Sandbox Applications
  - Leetcode Solutions
  - Other Projects
- scripts - Software scripts.
- setup - Setup scripts and configurations.
- snippets - Text and code snippets for quick copy and paste.

## Automation

- Commit Hooks
- Crontab
