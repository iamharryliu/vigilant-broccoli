# Github
alias gitme='open -a "Google Chrome" "https://github.com/iamharryliu"'
alias pushgitprofile="cd ~/iamharryliu && gpull && git add . && gc docs 'update github profile readme' && gpush"
# vigilant-broccoli
alias gitvb='open -a "Google Chrome" "https://github.com/iamharryliu/vigilant-broccoli"'
alias gitactions='open -a "Google Chrome" "https://github.com/iamharryliu/vigilant-broccoli/actions"'
alias cdvb="cd ~/$REPO_NAME/"
alias pushreadme="cdvb && git add README.md && gc docs readme 'update root README.md' && gpush"
alias pushnotes="cdvb && git add notes/**/*.md && gc docs 'update md notes' && gpush"
alias pushtodo="cdvb && git add TODO.md && gc docs todo 'update TODO.md' && gpush"
alias pushsnippets="cdvb && git add snippets/ && gc docs snippets 'update snippets' && gpush"
alias pushprogress="cdvb && git add snippets/progress.md && gc docs progress 'update progress.md' && gpush"
# Actions
alias pushactions="cdvb && git add .github/workflows && gc build github-actions 'update actions' && gpush"
# Setup
# Dotfiles
alias pushdotfiles="cdvb && git add setup/dotfiles/* && gc docs 'update dotfiles' && gpush"
alias pushaliases="cdvb && git add setup/dotfiles/zsh/aliases/ setup/dotfiles/zsh/scripts/ && gc feat aliases 'update aliases' && gpush"
# Homebrew
alias brewdump="cd vb && rm setup/mac/Brewfile && brew bundle dump --file=setup/mac/Brewfile"
alias pushbrew="cdvb && git add setup/mac/Brewfile && gc feat brew 'update brew' && gpush"
# Projects
# Nx
alias cdnx="cd ~/$REPO_NAME/projects/nx-workspace/"
# harryliu.design
alias serve-harryliu-design="cdnx && npm run serve:personal-website"
alias deploy-harryliu-design="cdnx && nx manual-deploy personal-website-frontend"
alias pushpagecontent="cdnx && git add apps/ui/personal-website-frontend/src/assets/site-content/ && gc feat personal-website 'update site content' && gpush"
alias pushresume="cdnx && git add apps/ui/personal-website-frontend/src/assets/HarryLiu-Resume.pdf && gc docs resume 'update resume' && gpush"
alias pushblog="cdnx && git add apps/ui/personal-website-frontend/src/assets/blogs && gc feat blog 'update blog' && gpush"
# Grind 75
alias grind75="python -m unittest discover -s ~/$REPO_NAME/projects/grind-75"
# Toronto Alerts
alias cdtorontoalerts="cdvb && cd projects/toronto-alerts"
# DJ Stuff
alias pushdj='cdvb && git subtree push --prefix=scripts/python/dj-scripts/spotify-to-mp3 git@github.com:iamharryliu/spotify-to-mp3.git main'
alias dldjmusic="cd ~/$REPO_NAME/scripts/python/dj-scripts/spotify-to-mp3 && source venv/bin/activate && python download_music.py"

# Journal
alias pushJournal="cd ~/journal && git add . && gc docs 'update journal' && gpush"

# Other
alias sshpi="ssh hliu@192.168.1.104"
