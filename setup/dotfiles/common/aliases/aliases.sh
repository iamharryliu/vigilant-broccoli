source $HOME/vigilant-broccoli/setup/dotfiles/common/directory_variables.sh

alias initsh='echo "~Shell initialized.~" && source ~/.zshrc'
alias reinstallsh="source $MAC_SETUP_DIR/install.sh"
alias brewinit="brew bundle --file $MAC_SETUP_DIR/Brewfile"
alias setupdock=". $MAC_SETUP_DIR/setup_dock.sh"
alias setupmac=". $MAC_SETUP_DIR/setup_macos_preferences.sh"
alias toggle-darkmode='osascript -e "tell application \"System Events\" to tell appearance preferences to set dark mode to not dark mode"'


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

alias cpsshpubkey='cat ~/.ssh/id_rsa.pub| pbcopy'

alarm() {
  (sleep "$1" && say "${2:-Time's up!}") &
}

timer() {
  (
    sleep "${1:-600}"
    afplay /System/Library/Sounds/Ping.aiff
    terminal-notifier -title "Alarm Timer" -message "${2:-Time is up!}"
    say "${2:-Time's up!}"
  ) &
}
