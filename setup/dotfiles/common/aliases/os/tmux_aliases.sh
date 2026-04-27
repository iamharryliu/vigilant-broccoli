alias vibecode="$REPO_DIR/setup/dotfiles/common/scripts/tmux-setup-dev.sh"

mktmuxw() {
    tmux new-window -n "$1" -c "${2:-.}"
}

rmtmuxw() {
    tmux kill-window -t "=$1"
}
