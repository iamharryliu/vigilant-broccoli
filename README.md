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

[![vigilant-broccoli - Deploy Nx Apps Status](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-nx-apps-actions.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-nx-apps-actions.yml)

[![vigilant-broccoli - Monitor Apps Status](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/monitor-apps-actions.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/monitor-apps-actions.yml)

[![Toronto Alerts - Deploy App Status](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-toronto-alerts-app-actions.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-toronto-alerts-app-actions.yml)

## Folder Structure

- setup - Setup scripts and configurations.
- notes
- projects
- scripts
- snippets

## Management

- pre-commit hook, husky, eslint, prettier
- Github Actions
- Nx Monorepo
