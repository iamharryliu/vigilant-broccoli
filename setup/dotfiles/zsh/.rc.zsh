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

explain_shell() {
    local query="$1";
    [ -z "$query" ] && echo "Usage: explain_shell '<command>'" && return 1;
    local url="https://explainshell.com/explain?cmd=$(echo "$query" | jq -sRr @uri)";
    command -v xdg-open > /dev/null && xdg-open "$url" || command -v open > /dev/null && open "$url" || echo "Open manually: $url";
}

source /opt/homebrew//share/powerlevel10k/powerlevel10k.zsh-theme

# To customize prompt, run `p10k configure` or edit ~/.p10k.zsh.
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh
