source $HOME/vigilant-broccoli/setup/dotfiles/common/aliases/aliases.sh
source $HOME/shell-aliases/devops_aliases.sh
source $HOME/shell-aliases/vigilant-broccoli_aliases.sh
if [ -f ~/shell-aliases/personal-aliases.sh ]; then
    source ~/shell-aliases/personal-aliases.sh
fi
if [ -f ~/shell-aliases/work-aliases.sh ]; then
    source ~/shell-aliases/work-aliases.sh
fi
