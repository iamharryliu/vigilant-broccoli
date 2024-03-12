
# vigilant-broccoli
alias brewdump='rm ~/vigilant-broccoli/setup/mac/Brewfile && brew bundle dump --file=~/vigilant-broccoli/setup/mac/Brewfile'
alias cdvb='cd ~/vigilant-broccoli/'
alias cdnx='cd ~/vigilant-broccoli/projects/nx-workspace/'
alias grind75='python -m unittest discover -s ~/vigilant-broccoli/projects/grind-75'
alias committodo="cdvb && git add TODO.md && git commit -m 'docs: update TODO.md'"
alias commitdotfiles="cdvb && git add setup/dotfiles && git commit -m 'docs: update TODO.md'"
alias commitjournal="git add ~/journal/ && git commit -m 'docs: update journal'"
alias commitmd="cdvb && git add README.md TODO.md snippets/*.md notes/**/*.md && gc docs 'update md files'"
alias commitaliases="cdvb && git add setup/dotfiles/zsh/.aliases.zsh setup/dotfiles/zsh/aliases/* setup/dotfiles/zsh/scripts/* && gc feat aliases 'update .aliases.zsh'"

# Github
alias updategitreadme="cd ~/iamharryliu && git add . && git commit -m 'docs: update github profile readme' && git push"
alias openvb='open -a "Google Chrome" "https://github.com/iamharryliu/vigilant-broccoli"'
alias openvbactions='open -a "Google Chrome" "https://github.com/iamharryliu/vigilant-broccoli/actions"'

# harryliu.design
alias servepw='cdnx && npm run serve:personal-website'
alias deploypwui="cdnx && nx deploy personal-website-frontend --skip-nx-cache"

# Journal
alias pushJournal="cd ~/journal && git add . && git commit -m 'docs: update journal' && git push"
