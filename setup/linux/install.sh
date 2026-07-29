#!/bin/bash
REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)

if [ "$REPO_ROOT" != "$HOME/vigilant-broccoli" ]; then
    ln -sfn "$REPO_ROOT" "$HOME/vigilant-broccoli"
    echo "Symlinked $HOME/vigilant-broccoli -> $REPO_ROOT"
fi

source $HOME/vigilant-broccoli/setup/dotfiles/common/aliases/aliases.sh
source $SETUP_DIR/common/symlinks.sh

if [ "$1" = "-y" ]; then
    ask() { return 0; }
elif ask "Install apt packages?"; then
    sudo apt-get update && xargs sudo apt-get install -y < "$REPO_ROOT/setup/linux/apt-packages.txt"
fi

if ask "Symlink dotfiles?"; then
    symlink_common_dotfiles
fi

RC_LINE='source $HOME/vigilant-broccoli/setup/dotfiles/bash/.rc.bash'
grep -qxF "$RC_LINE" "$HOME/.bashrc" 2>/dev/null || echo "$RC_LINE" >> "$HOME/.bashrc"
echo "Added rc hook to ~/.bashrc"
