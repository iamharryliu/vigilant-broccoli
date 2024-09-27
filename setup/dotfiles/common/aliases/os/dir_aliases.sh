alias ..='cd ..'
alias ..x2='cd ../..'
alias ..x3='cd ../../..'
newfile() {
    mkdir -p "$(dirname "$1")" && touch "$1" && code "$1"
}
alias mkdir='mkdir -pv'
alias mkcd='function _mkcd() { mkdir -p "$1" && cd "$1"; }; _mkcd'
alias ls='ls -FGhl'
alias la='ls -A'
alias lS='la -S'
alias lSr='la -Sr'
alias lt='la -t'
alias ltr='la -rt'
