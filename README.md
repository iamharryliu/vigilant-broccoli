# vigilant-broccoli

## About

vigilant-broccoli is my personal mono-repo that I use to house all the code (or most) and documentation that I am working on.

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

## Github Action Status

[![Deploy Nx Apps](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-nx-apps.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/deploy-nx-apps.yml)

[![Monitor Apps](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/monitor-apps.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/monitor-apps.yml)

[![GTA Update Alert - Email Subscribers](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/email-gta-update-alert-subscribers.yml/badge.svg)](https://github.com/iamharryliu/vigilant-broccoli/actions/workflows/email-gta-update-alert-subscribers.yml)
