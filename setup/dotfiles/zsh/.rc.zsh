echo "~Shell initialized.~"
export REPO_NAME="vigilant-broccoli"
source ~/.zsh_aliases
source ~/.env.sh

export PATH="/opt/homebrew/bin:$PATH"

if [ "$IS_CRON" = "true" ]; then
    echo "Script is being run by cron"
else
    if [[ $(sysctl -n machdep.cpu.brand_string | grep -c "Apple") -gt 0 ]]; then
        # echo "Setting zsh-autosuggestions for Apple Silicon (M series)"
        source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh
    else
        # echo "Setting zsh-autosuggestions for macOS Intel"
        source /usr/local/share/zsh-autosuggestions/zsh-autosuggestions.zsh
    fi
fi

chmod -R +x ~/shell-aliases/
chmod -R +x ~/shell-scripts/
