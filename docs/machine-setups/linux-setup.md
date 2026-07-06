## Linux Setup

### Prerequisites

Install Git (choose the command for your distribution):

**Debian/Ubuntu:**

```bash
sudo apt-get update && sudo apt-get install -y git
```

**Fedora/RHEL:**

```bash
sudo dnf install -y git
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

# Display public key (copy manually)
cat ~/.ssh/id_rsa.pub

# Add SSH key to GitHub at https://github.com/settings/keys

# Clone repo with SSH
cd ~ && git clone git@github.com:iamharryliu/vigilant-broccoli.git
```

### Run Setup

```bash
cd ~/vigilant-broccoli && pnpm local:install:machine-setup
```

This will automatically run the Linux-specific setup script.
