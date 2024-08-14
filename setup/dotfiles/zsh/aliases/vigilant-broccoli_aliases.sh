# Directories
REPO_NAME="vigilant-broccoli"
JOURNAL_DIR="~/journal"
REPO_DIR="~/$REPO_NAME"
PROJECTS_DIR="$REPO_DIR/projects"
GRIND75_DIR="$PROJECTS_DIR/grind-75"
NX_DIR="$PROJECTS_DIR/nx-workspace"
# Directory
alias cdvb="cd $REPO_DIR"
alias cdjournal="cd $JOURNAL_DIR"
alias cdprojects="cd $PROJECTS_DIR"
alias cdgrind75="cd $GRIND75_DIR"
alias cdgrind75ts="cdgrind75 && cd typescript"
alias cdgrind75py="cdgrind75 && cd python"
alias cdgrind75go="cdgrind75 && cd go"
alias cddemoapps="cdprojects && cd demo-apps"
alias cdnx="cd $NX_DIR"
# Github
alias gitme='chrome "https://github.com/iamharryliu"'
alias pushgitprofile="cd ~/iamharryliu && gpull && git add . && gc docs 'update github profile readme' && gpush"
# Demo Apps
alias serveReactDemo="cddemoapps && cd react-demo && npm run start"
alias serveExpressDemo="cddemoapps && cd express-demo && npm run serve"
# vigilant-broccoli
alias gitvb='chrome "https://github.com/iamharryliu/vigilant-broccoli"'
alias gitactions='chrome "https://github.com/iamharryliu/vigilant-broccoli/actions"'
alias pushreadme="cdvb && git add README.md && gc docs readme 'update root README.md' && gpush"
alias pushnotes="cdvb && git add notes/ && gc docs 'update md notes' && gpush"
alias pushtodo="cdvb && git add TODO.md && gc docs todo 'update TODO.md' && gpush"
alias pushsnippets="cdvb && git add snippets/ && gc docs snippets 'update snippets' && gpush"
alias pushprogress="cdvb && git add snippets/progress.md && gc docs progress 'update progress.md' && gpush"
# Actions
alias pushactions="cdvb && git add .github/workflows/ && gc build github-actions 'update actions' && gpush"
# Setup
alias pushsetup="cdvb && git add setup/ && gc feat setup 'enhance setup scripts' && gpush"
# Dotfiles
alias pushdotfiles="cdvb && git add setup/dotfiles/* && gc docs 'update dotfiles' && gpush"
alias pushaliases="cdvb && git add setup/dotfiles/zsh/aliases/ setup/dotfiles/zsh/scripts/ && gc feat aliases 'update aliases' && gpush"
# Homebrew
alias brewdump="cdvb && rm setup/mac/Brewfile && brew bundle dump --file=setup/mac/Brewfile"
alias pushbrew="cdvb && git add setup/mac/Brewfile && gc feat brew 'update brew' && gpush"
# Projects
# Secrets Manager
alias pushsecretsmanager="cdvb && git add projects/secret-manager/ && gc build 'update secrets manager' && gpush"
# harryliu.design
alias servehld="cdnx && nx serve personal-website-frontend"
alias serve-harryliu-design="cdnx && npm run serve:personal-website"
alias deploy-harryliu-design="cdnx && nx manual-deploy personal-website-frontend"
alias pushpagecontent="cdnx && git add apps/ui/personal-website-frontend/src/assets/site-content/ && gc feat personal-website 'update site content' && gpush"

alias pushresume="cdnx && git add apps/ui/personal-website-frontend/src/assets/HarryLiu-Resume.pdf && gc docs resume 'update resume' && gpush"
alias pushblog="cdnx && git add apps/ui/personal-website-frontend/src/assets/blogs && gc feat blog 'update blog' && gpush"
# Grind 75
alias testgrind75py="python -m unittest discover -s $GRIND75_DIR/python"
alias testgrind75ts="cdgrind75ts && npx jest $GRIND75_DIR/typescript"
alias testgrind75go="go test $GRIND75_DIR/..."
alias testgrind75="testgrind75py && testgrind75ts && testgrind75go"
# CMS
alias servecms="cdvb; cd projects/cms-flask/; venvon; flaskrun"
alias servecmsdev="cdvb; cd projects/cms-flask/; venvon; python dev_manager.py DIT runserver"
# Toronto Alerts
alias cdtorontoalerts="cdvb && cd projects/toronto-alerts/toronto-alerts-flask"
alias servetorontoalerts="cdtorontoalerts && venvon && flaskrun"
alias pushlines="cdvb && git add scripts/python/scrape-ttc-lines/ttc_lines.json && gc chore toronto-alerts 'add lines' && gpush"
# Cloud8
alias servecloud8="cdnx && nx serve cloud-8-skate-angular"
alias pushc8spagecontent="cdnx && git add apps/ui/cloud-8-skate-angular/src/assets/site-content/ && gc feat cloud8skate 'update site content' && gpush"
# DJ Stuff
alias pushdj='cdvb && git subtree push --prefix=scripts/python/dj-scripts/spotify-to-mp3 git@github.com:iamharryliu/spotify-to-mp3.git main'
alias dldjmusic="cd ~/$REPO_NAME/scripts/python/dj-scripts/spotify-to-mp3 && source venv/bin/activate && python download_music.py"

# Journal
alias pushJournal="cdjournal && git add . && gc docs 'update journal' && gpush"

# Other
alias sshpi="ssh hliu@192.168.1.104"
alias machinesetup="cdvb && ./setup/mac/install.sh"
