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
