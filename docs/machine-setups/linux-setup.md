### Linux Machine Setup

```bash
# Install Git (if not already installed)
# Debian/Ubuntu
sudo apt update && sudo apt install git -y
# Fedora
sudo dnf install git -y
# Arch
sudo pacman -S git

# Clone using HTTPS
cd ~ && git clone https://github.com/iamharryliu/vigilant-broccoli.git

# Clone repo using SSH key
# Setup SSH key
ssh-keygen -b 4096 -t rsa
cat ~/.ssh/id_rsa.pub | xclip -selection clipboard
xdg-open 'https://github.com/settings/keys'
# Clone repo
cd ~ && git clone git@github.com:iamharryliu/vigilant-broccoli.git

# Run install script
chmod +x ~/vigilant-broccoli/setup/linux/install.sh
source ~/vigilant-broccoli/setup/linux/install.sh
```

**Additional Preferences**

- Install `xclip` or `wl-clipboard` for clipboard support
- Install `fzf` for fuzzy file finding
- Install `oh-my-zsh` for enhanced shell (optional)
