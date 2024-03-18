
# vigilant-broccoli
alias brewdump='rm ~/vigilant-broccoli/setup/mac/Brewfile && brew bundle dump --file=~/vigilant-broccoli/setup/mac/Brewfile'
alias cdvb='cd ~/vigilant-broccoli/'
alias cdnx='cd ~/vigilant-broccoli/projects/nx-workspace/'
alias grind75='python -m unittest discover -s ~/vigilant-broccoli/projects/grind-75'
alias pushtodo="cdvb && git add TODO.md && gc docs 'update TODO.md' && gpush"
alias commitmd="cdvb && git add README.md TODO.md snippets/*.md notes/**/*.md && gc docs 'update md files'"
alias pushmd="commitmd && gpush"
alias commitdotfiles="cdvb && git add setup/dotfiles && git reset setup/dotfiles/zsh/.env.sh && gc docs 'update dotfiles'"
alias pushdotfiles="commitdotfiles && gpush"
alias dldjmusic='python ~/vigilant-broccoli/scripts/python/dj-scripts/spotify_to_dj_library.py'

# Journal
alias pushJournal="cd ~/journal && git add . && gc docs 'update journal' && gpush"
alias updaterepos="cd ~/journal && gpull && cd ~/vigilant-broccoli && gpull"

# Github
alias pushgitreadme="cd ~/iamharryliu && gpull && git add . && gc docs 'update github profile readme' && gpush"
alias openvb='open -a "Google Chrome" "https://github.com/iamharryliu/vigilant-broccoli"'
alias openvbactions='open -a "Google Chrome" "https://github.com/iamharryliu/vigilant-broccoli/actions"'

# harryliu.design
alias servepw='cdnx && npm run serve:personal-website'
alias deploypwui="cdnx && nx deploy personal-website-frontend --skip-nx-cache"
