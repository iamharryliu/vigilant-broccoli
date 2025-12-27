alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'
newfile() {
    mkdir -p "$(dirname "$1")" && touch "$1" && code "$1"
}
alias mkdir='mkdir -pv'
alias mkcd='function _mkcd() { mkdir -p "$1" && cd "$1"; }; _mkcd'

if [[ "$(uname)" == "Darwin" ]]; then
  alias ls='ls -FGhl'
else
  alias ls='ls -Fhl --color=auto'
fi

alias la='ls -A'
alias lS='la -S'
alias lSr='la -Sr'
alias lt='la -t'
alias ltr='la -rt'
