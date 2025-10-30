source ~/.zsh_aliases

export PATH="/opt/homebrew/bin:$PATH"

if [ "$IS_CRON" != "true" ]; then
    setopt interactive_comments
    # Setting zsh-autosuggestions for Apple Silicon (M series
    if [[ $(sysctl -n machdep.cpu.brand_string | grep -c "Apple") -gt 0 ]]; then
        source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh
        source /opt/homebrew/share/powerlevel10k/powerlevel10k.zsh-theme
        [[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh
    # Setting zsh-autosuggestions for macOS Intel
    else
        source /usr/local/share/zsh-autosuggestions/zsh-autosuggestions.zsh
    fi
fi
