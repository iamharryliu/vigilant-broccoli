alias initsh='echo "~Shell initialized.~" && source ~/.zshrc'

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
