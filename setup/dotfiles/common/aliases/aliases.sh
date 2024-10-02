source $HOME/vigilant-broccoli/setup/dotfiles/common/directory_variables.sh

alias initsh='echo "~Shell initialized.~" && source ~/.zshrc'
alias reinstallsh="$MAC_SETUP_DIR/install.sh"

alias setupdock=". $MAC_SETUP_DIR/setup_dock.sh"
alias setupmac=". $MAC_SETUP_DIR/setup_macos_preferences.sh"

load_aliases() {
  local dir="$1"
  find "$dir" -name "*.sh" | while read -r script; do
    source "$script"
  done
}

BASE_DIR=~/shell-common/aliases
for SUB_DIR in os devops network; do
  load_aliases "$BASE_DIR/$SUB_DIR"
done
