# vigilant-broccoli

## About

vigilant-broccoli is my personal monorepo, developer toolkit and passion project.

<img src="https://i.pinimg.com/564x/b7/62/38/b762386c0bbb20dec77c2632f73d28a8.jpg" alt="broccoli" width="200"/>

## Machine Setup

### Mac

```
# Install Brew and Git.
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
export PATH="/opt/homebrew/bin:$PATH" >> ~/.zshrc
brew install git

# Clone monorepo and run install script.
cd ~ && git clone git@github.com:iamharryliu/vigilant-broccoli.git
chmod +x ~/vigilant-broccoli/setup/mac/install.sh
~/vigilant-broccoli/setup/mac/install.sh
```

## Github Action Statuses

[![Deploy Nx Apps](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-nx-apps.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-nx-apps.yml)

[![Monitor Apps](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/monitor-apps.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/monitor-apps.yml)

[![Deploy GTA Update Alert App](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-gta-update-alert.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-gta-update-alert.yml)

[![GTA Update Alert - Email Subscribers](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/email-gta-update-alert-subscribers.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/email-gta-update-alert-subscribers.yml)

## Folder Structure

- setup - machine setup configurations and scripts
- notes - collection of markdown notes
- projects - collection of personal projects
- scripts - collection of personal scripts
- snippets - random snippers

## Management

- pre-commit hook, husky, eslint, prettier
- Github Actions
- Nx Monorepo
