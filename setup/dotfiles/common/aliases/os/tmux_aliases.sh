alias vibecode="$REPO_DIR/scripts/shell/tmux-setup-dev.sh"

newtmuxwindow() {
    tmux new-window -n "$1" -c "${2:-.}"
}

rmtmuxw() {
    tmux kill-window -t "=$1"
}
