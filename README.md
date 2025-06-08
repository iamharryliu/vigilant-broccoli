# vigilant-broccoli

## About

vigilant-broccoli, my personal software toolkit.

<div>
<img src="https://i.pinimg.com/564x/b7/62/38/b762386c0bbb20dec77c2632f73d28a8.jpg" alt="broccoli" width="200"/>
</div>

## Machine Setup

### Macbook Pro (MBP)

```
# Install Brew and Git.
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
export PATH="/opt/homebrew/bin:$PATH" >> ~/.zshrc
brew install git

# Clone using HTTP.
cd ~ && git clone https://github.com/iamharryliu/vigilant-broccoli.git

# Clone repo using SSH key.
# Setup SSH key.
ssh-keygen -b 4096 -t rsa
cat ~/.ssh/id_rsa.pub| pbcopy
open 'https://github.com/settings/keys'
# Clone repo.
cd ~ && git clone git@github.com:iamharryliu/vigilant-broccoli.git

# Run install script.
chmod +x ~/vigilant-broccoli/setup/mac/install.sh
source ~/vigilant-broccoli/setup/mac/install.sh
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
