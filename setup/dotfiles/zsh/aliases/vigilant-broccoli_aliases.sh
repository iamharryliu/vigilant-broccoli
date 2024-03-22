
# vigilant-broccoli
alias brewdump="rm ~/$REPO_NAME/setup/mac/Brewfile && brew bundle dump --file=~/$REPO_NAME/setup/mac/Brewfile"
alias cdvb="cd ~/$REPO_NAME/"
alias cdnx="cd ~/$REPO_NAME/projects/nx-workspace/"
alias grind75="python -m unittest discover -s ~/$REPO_NAME/projects/grind-75"
alias pushtodo="cdvb && git add TODO.md && gc docs 'update TODO.md' && gpush"
alias commitmd="cdvb && git add README.md TODO.md snippets/*.md notes/**/*.md && gc docs 'update md files'"
alias pushmd="commitmd && gpush"
alias commitdotfiles="cdvb && git add setup/dotfiles && git reset setup/dotfiles/zsh/.env.sh && gc docs 'update dotfiles'"
alias pushdotfiles="commitdotfiles && gpush"
alias pushactions="cdvb && git add .github/workflows && gc build github-actions 'update actions' && gpush"
alias vbactions='open -a "Google Chrome" "https://github.com/iamharryliu/vigilant-broccoli/actions"'
# DJ Stuff
alias pushspottoyt='cdvb && git subtree push --prefix=scripts/python/dj-scripts/spotify-to-mp3 git@github.com:iamharryliu/spotify-to-mp3.git main'
alias dldjmusic="cd ~/$REPO_NAME/scripts/python/dj-scripts/spotify-to-mp3 && source venv/bin/activate && python download_music.py"

# Journal
alias pushJournal="cd ~/journal && git add . && gc docs 'update journal' && gpush"
alias updaterepos="cd ~/journal && gpull && cd ~/$REPO_NAME && gpull"

# Github
alias pushgitreadme="cd ~/iamharryliu && gpull && git add . && gc docs 'update github profile readme' && gpush"
alias openvb='open -a "Google Chrome" "https://github.com/iamharryliu/vigilant-broccoli"'
alias openvbactions='open -a "Google Chrome" "https://github.com/iamharryliu/vigilant-broccoli/actions"'

# harryliu.design
alias servepw="cdnx && npm run serve:personal-website"
alias deploypwui="cdnx && nx deploy personal-website-frontend --skip-nx-cache"
