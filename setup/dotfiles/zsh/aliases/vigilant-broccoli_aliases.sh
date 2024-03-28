
# vigilant-broccoli
alias brewdump="rm ~/$REPO_NAME/setup/mac/Brewfile && brew bundle dump --file=~/$REPO_NAME/setup/mac/Brewfile"
alias cdvb="cd ~/$REPO_NAME/"
alias cdnx="cd ~/$REPO_NAME/projects/nx-workspace/"
alias grind75="python -m unittest discover -s ~/$REPO_NAME/projects/grind-75"
alias pushnotes="cdvb && git add notes/**/*.md && gc docs 'update md notes' && gpush"
alias pushtodo="cdvb && git add TODO.md && gc docs todo 'update TODO.md' && gpush"
alias pushreadme="cdvb && git add README.md && gc docs readme 'update root README.md' && gpush"
# TODO: look at cost benefit of this vs git magic
alias commitdotfiles="cdvb && git add setup/dotfiles && git reset setup/dotfiles/zsh/.env.sh && gc docs 'update dotfiles'"
alias pushaliases="cdvb && git add setup/dotfiles/zsh/aliases/ setup/dotfiles/zsh/scripts/ && gc feat aliases 'update aliases' && gpush"
alias pushdotfiles="commitdotfiles && gpush"
alias pushactions="cdvb && git add .github/workflows && gc build github-actions 'update actions' && gpush"
alias openactions='open -a "Google Chrome" "https://github.com/iamharryliu/vigilant-broccoli/actions"'
# DJ Stuff
alias pushdj='cdvb && git subtree push --prefix=scripts/python/dj-scripts/spotify-to-mp3 git@github.com:iamharryliu/spotify-to-mp3.git main'
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
alias pushpagecontent="cdnx && git add apps/ui/personal-website-frontend/src/assets/site-content/ && gc feat personal-website 'update site content' && gpush"
alias pushblog="cdnx && git add apps/ui/personal-website-frontend/src/assets/blogs && gc feat blog 'update blog' && gpush"
