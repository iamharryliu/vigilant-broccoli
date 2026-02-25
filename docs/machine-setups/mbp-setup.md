### Macbook Pro (MBP) Setup

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

**Additional Preferences**

- Divvy Shortcut `CMD + Shift + Spacebar`
- RayCast
  - File search
  - Emoji finder
  - Clipboard history
