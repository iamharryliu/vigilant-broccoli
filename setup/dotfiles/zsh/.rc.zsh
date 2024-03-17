echo "~Shell initialized.~"
source ~/.zsh_aliases
source ~/.env.sh

export PATH="/opt/homebrew/bin:$PATH"
if [[ $(sysctl -n machdep.cpu.brand_string | grep -c "Apple") -gt 0 ]]; then
    # Running on Apple Silicon (M series)
    echo "Running on Apple Silicon (M series)"
    source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh
else
    # Running on Intel
    echo "Running on Intel"
    source /usr/local/share/zsh-autosuggestions/zsh-autosuggestions.zsh
fi

