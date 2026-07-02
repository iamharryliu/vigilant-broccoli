source $HOME/vigilant-broccoli/setup/dotfiles/common/directory_variables.sh

if [ "$(uname)" = "Darwin" ]; then
    alias initsh='echo "~Shell initialized.~" && source ~/.zshrc'
else
    alias initsh='echo "~Shell initialized.~" && source ~/.bashrc'
fi
if [ "$(uname)" = "Darwin" ]; then
    alias reinstallsh="source $MAC_SETUP_DIR/install.sh"
else
    alias reinstallsh="source $SETUP_DIR/linux/install.sh"
fi


load_aliases() {
  local dir="$1"
  local script
  while read -r script; do
    source "$script"
  done < <(find "$dir" -name "*.sh")
}

BASE_DIR=$COMMON_DOTFILES_DIR/aliases
for SUB_DIR in os devops network; do
  load_aliases "$BASE_DIR/$SUB_DIR"
done

function ask() {
    echo -n "$1 (Y/n): "
    if [[ $SHELL == */zsh ]]; then
        read -r -k1 resp
    else
        read -r -n1 resp
    fi
    echo

    if [ -z "$resp" ]; then
        response_lc="y"
    else
        response_lc=$(echo "$resp" | tr '[:upper:]' '[:lower:]')
    fi

    [ "$response_lc" = "y" ]
}

explain_shell() {
    local query="$1";
    [ -z "$query" ] && echo "Usage: explain_shell '<command>'" && return 1;
    local url="https://explainshell.com/explain?cmd=$(echo "$query" | jq -sRr @uri)";
    command -v xdg-open > /dev/null && xdg-open "$url" || command -v open > /dev/null && open "$url" || echo "Open manually: $url";
}

alias spellcheck='codespell'

alias neovideterminal='neovide -- -c "terminal" -c "startinsert"'
