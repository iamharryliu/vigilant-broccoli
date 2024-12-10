source ~/.env.sh
source ~/.zsh_aliases

export PATH="/opt/homebrew/bin:$PATH"

if [ "$IS_CRON" != "true" ]; then
    setopt interactive_comments
    if [[ $(sysctl -n machdep.cpu.brand_string | grep -c "Apple") -gt 0 ]]; then
        # echo "Setting zsh-autosuggestions for Apple Silicon (M series)"
        source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh
    else
        # echo "Setting zsh-autosuggestions for macOS Intel"
        source /usr/local/share/zsh-autosuggestions/zsh-autosuggestions.zsh
    fi
fi

# TODO: Move to appropriate places.
autoload -U colors && colors
PS1="%{$fg[red]%}%n%{$reset_color%}@%{$fg[blue]%}%m %{$fg[yellow]%}%~ %{$reset_color%}%% "

explain_shell() {
    local query="$1";
    [ -z "$query" ] && echo "Usage: explain_shell '<command>'" && return 1;
    local url="https://explainshell.com/explain?cmd=$(echo "$query" | jq -sRr @uri)";
    command -v xdg-open > /dev/null && xdg-open "$url" || command -v open > /dev/null && open "$url" || echo "Open manually: $url";
}
