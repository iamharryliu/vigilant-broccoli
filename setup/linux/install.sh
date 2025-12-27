#!/bin/bash

# Linux installation script for vigilant-broccoli dotfiles
# This script sets up only the Linux-compatible aliases and configurations

# Source the common aliases to get the ask() function
source $HOME/vigilant-broccoli/setup/dotfiles/common/aliases/aliases.sh

create_symlink() {
    local target=$1
    local link_name=$2

    if [ -L "$link_name" ]; then
        echo "Symbolic link $link_name already exists."
        return 0
    elif [ -e "$link_name" ]; then
        echo "File $link_name already exists but is not a symbolic link."
        if ask "Replace existing file at $link_name?"; then
            rm -rf "$link_name"
            echo "Removed existing file or symlink at $link_name"
        else
            echo "Skipping $link_name"
            return 1
        fi
    fi

    ln -s "$target" "$link_name"
    echo "Created symbolic link $link_name -> $target"
}

if ask "Install system dependencies?"; then
    echo "Detecting Linux distribution..."

    if [ -f /etc/debian_version ]; then
        echo "Debian/Ubuntu detected"
        sudo apt update
        sudo apt install -y git curl wget vim tmux xclip fzf
    elif [ -f /etc/redhat-release ]; then
        echo "RHEL/CentOS/Fedora detected"
        sudo dnf install -y git curl wget vim tmux xclip fzf
    elif [ -f /etc/arch-release ]; then
        echo "Arch Linux detected"
        sudo pacman -S --noconfirm git curl wget vim tmux xclip fzf
    else
        echo "Unknown distribution. Please install dependencies manually:"
        echo "  - git, curl, wget, vim, tmux"
        echo "  - xclip (for clipboard support)"
        echo "  - fzf (fuzzy finder)"
    fi
fi

if ask "Symlink Linux-compatible dotfiles?"; then
    # Create the shell-common symlink for all common aliases
    create_symlink "$COMMON_DOTFILES_DIR" "$HOME/shell-common"

    # Create the Linux-specific shell RC file
    create_symlink "$LINUX_SETUP_DIR/.bashrc_linux" "$HOME/.bashrc_linux"

    # Symlink common config files
    create_symlink "$DOTFILES_DIR/.gitconfig" "$HOME/.gitconfig"
    create_symlink "$DOTFILES_DIR/.tmux.conf" "$HOME/.tmux.conf"
    create_symlink "$DOTFILES_DIR/.vimrc" "$HOME/.vimrc"

    # Add source line to .bashrc if not already present
    if ! grep -q "source ~/.bashrc_linux" "$HOME/.bashrc" 2>/dev/null; then
        echo "" >> "$HOME/.bashrc"
        echo "# Source vigilant-broccoli Linux aliases" >> "$HOME/.bashrc"
        echo "source ~/.bashrc_linux" >> "$HOME/.bashrc"
        echo "Added source line to ~/.bashrc"
    else
        echo "~/.bashrc already sources ~/.bashrc_linux"
    fi

    # If using zsh, add to .zshrc as well
    if [ -n "$ZSH_VERSION" ] || command -v zsh &>/dev/null; then
        if ask "Also setup for zsh?"; then
            if ! grep -q "source ~/.bashrc_linux" "$HOME/.zshrc" 2>/dev/null; then
                echo "" >> "$HOME/.zshrc"
                echo "# Source vigilant-broccoli Linux aliases" >> "$HOME/.zshrc"
                echo "source ~/.bashrc_linux" >> "$HOME/.zshrc"
                echo "Added source line to ~/.zshrc"
            else
                echo "~/.zshrc already sources ~/.bashrc_linux"
            fi
        fi
    fi
fi


echo ""
echo "✅ Linux setup complete!"
echo ""
echo "To activate the changes, run:"
echo "  source ~/.bashrc"
echo ""
echo "Or if using zsh:"
echo "  source ~/.zshrc"
echo ""
