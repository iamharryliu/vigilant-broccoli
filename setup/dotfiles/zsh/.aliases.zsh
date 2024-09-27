alias initsh='echo "~Shell initialized.~" && source ~/.zshrc'

source ~/shell-common/aliases/aliases.sh
source ~/shell-aliases/quick_link_aliases.sh
source ~/shell-aliases/python_aliases.sh
source ~/shell-aliases/devops_aliases.sh
source ~/shell-aliases/vigilant-broccoli_aliases.sh
if [ -f ~/shell-aliases/personal-aliases.sh ]; then
    source ~/shell-aliases/personal-aliases.sh
fi
