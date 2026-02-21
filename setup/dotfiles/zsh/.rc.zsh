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

# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$('/opt/homebrew/Caskroom/mambaforge/base/bin/conda' 'shell.zsh' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "/opt/homebrew/Caskroom/mambaforge/base/etc/profile.d/conda.sh" ]; then
        . "/opt/homebrew/Caskroom/mambaforge/base/etc/profile.d/conda.sh"
    else
        export PATH="/opt/homebrew/Caskroom/mambaforge/base/bin:$PATH"
    fi
fi
unset __conda_setup
# <<< conda initialize <<<

source ~/.bash_profile

tmux source-file ~/.tmux.conf 2>/dev/null
