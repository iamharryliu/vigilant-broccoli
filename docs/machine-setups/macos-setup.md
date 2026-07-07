## macOS Setup

### Prerequisites

Install Homebrew and Git:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
export PATH="/opt/homebrew/bin:$PATH" >> ~/.zshrc
brew install git
```

### Clone Repository

**Option 1: Using HTTP**

```bash
cd ~ && git clone https://github.com/iamharryliu/vigilant-broccoli.git
```

**Option 2: Using SSH**

```bash
# Setup SSH key
ssh-keygen -b 4096 -t rsa

# Copy public key to clipboard
cat ~/.ssh/id_rsa.pub | pbcopy

# Add SSH key to GitHub
open 'https://github.com/settings/keys'

# Clone repo with SSH
cd ~ && git clone git@github.com:iamharryliu/vigilant-broccoli.git
```

### Run Setup

```bash
cd ~/vigilant-broccoli && pnpm local:install:machine-setup
```

This will automatically run the macOS-specific setup script.

### Additional Preferences

- Divvy Shortcut `CMD + Shift + Spacebar`
- RayCast
  - File search
  - Emoji finder
  - Clipboard history
