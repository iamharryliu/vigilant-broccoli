alias openvbws='code ~/Desktop/vb.code-workspace'
alias openworkws='code ~/Desktop/work.code-workspace'
alias openworkstuff='openworkws && openSlack'
# Directories
JOURNAL_DIR="~/Library/Mobile\ Documents/iCloud~md~obsidian/Documents/journal"
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
alias pushleetcode="git add $GRIND75_DIR && gc feat leetcode 'Update leetcode.' && gpush"
alias cdnx="cd $NX_DIR"
# Github
alias gitme='chrome "https://github.com/iamharryliu"'
alias pushgitprofile="cd ~/iamharryliu && gpull && git add . && gc docs 'Update Github profile README.md' && gpush"
# Demo Apps
alias serveReactDemo="cddemoapps && cd react-demo && npm run start"
alias serveExpressDemo="cddemoapps && cd express-demo && npm run serve"
# vigilant-broccoli
alias pullvb="cd $REPO_DIR && gpull"
alias pulljournal="cd $JOURNAL_DIR && gpull"
alias pullall='pulljournal && pullvb'
alias gitvb='chrome "https://github.com/iamharryliu/vigilant-broccoli"'
alias gitactions='chrome "https://github.com/iamharryliu/vigilant-broccoli/actions"'
alias pushreadme="cdvb && git add README.md && gc docs readme 'Update root README.md file.' && gpush"
alias pushnotes="cdvb && git add $NOTES_DIR && gc docs 'Update Markdown notes.' && gpush"
alias pushtodo="cdvb && git add $TODO_FILEPATH && gc docs todo 'Update TODO.md file.' && gpush"
alias pushsnippets="cdvb && git add $SNIPPETS_DIR && gc docs snippets 'Update snippets.' && gpush"
alias pushprogress="git add $SNIPPETS_DIR/progress.md && gc docs progress 'Update progress.md file.' && gpush"
# Actions
alias pushactions="cdvb && git add $GIT_WORKFLOWS_DIR && gc build github-actions 'Update Github actions.' && gpush"
# Setup
alias pushsetup="cdvb && git add $SETUP_DIR && gc feat setup 'Update setup scripts.' && gpush"
# Dotfiles
alias pushdotfiles="cdvb && git add $DOTFILES_DIR && gc docs 'Update dotfiles.' && gpush"
# Homebrew
alias brewdump="rm $MAC_SETUP_DIR/Brewfile && brew bundle dump --file=$MAC_SETUP_DIR/Brewfile"
alias pushbrew="cdvb && git add $MAC_SETUP_DIR/Brewfile && gc feat brew 'Update Brew file.' && gpush"
# Projects
# Secrets Manager
alias pushsecretsmanager="cdvb && git add $PROJECTS_DIR/secret-manager/ && gc build 'Update secrets manager.' && gpush"
# harryliu.design
alias servehld="cdnx && nx serve personal-website-frontend"
alias serve-harryliu-design="cdnx && npm run serve:personal-website"
alias deploy-harryliu-design="cdnx && nx manual-deploy personal-website-frontend"
alias pushpagecontent="cdnx && git add apps/ui/personal-website-frontend/src/assets/site-content/ && gc feat personal-website 'Update site content.' && gpush"

alias pushresume="cdnx && git add apps/ui/personal-website-frontend/src/assets/HarryLiu-Resume.pdf && gc docs resume 'Update resume.' && gpush"
alias pushblog="cdnx && git add apps/ui/personal-website-frontend/src/assets/blogs && gc feat blog 'Update blog.' && gpush"
# Grind 75
alias testgrind75py="python -m unittest discover -s $GRIND75_DIR/python"
alias testgrind75ts="cdgrind75ts && npx jest $GRIND75_DIR/typescript"
alias testgrind75go="go test $GRIND75_DIR/..."
alias testgrind75="testgrind75py && testgrind75ts && testgrind75go"
# CMS
alias servecms="cdvb; cd projects/cms-flask/; venvon; flaskrun"
alias servecmsdev="cdvb; cd projects/cms-flask/; venvon; python dev_manager.py DIT runserver"
# Toronto Alerts
alias cdtorontoalerts="cd $PROJECTS_DIR/toronto-alerts/toronto-alerts-flask"
alias servetorontoalerts="cdtorontoalerts && venvon && flaskrun"
alias pushlines="cdvb && git add scripts/python/scrape-ttc-lines/ttc_lines.json && gc chore toronto-alerts 'Add TTC lines.' && gpush"
# Cloud8
alias servecloud8="cdnx && nx serve cloud-8-skate-angular"
alias pushc8spagecontent="cdnx && git add apps/ui/cloud-8-skate-angular/src/assets/site-content/ && gc feat cloud8skate 'Update site content.' && gpush"
# DJ Stuff
alias pushdj='cdvb && git subtree push --prefix=scripts/python/dj-scripts/spotify-to-mp3 git@github.com:iamharryliu/spotify-to-mp3.git main'
alias dldjmusic="cd $REPO_DIR/scripts/python/dj-scripts/spotify-to-mp3 && source venv/bin/activate && python download_music.py"

# Journal
alias pushJournal="cdjournal && git add . && gc docs 'Update journal.' && gpush"

# Other
alias sshpi="ssh hliu@192.168.1.104"
## Obsidian
alias openNotes="open 'obsidian://open?vault=notes'"
alias openJournal="open 'obsidian://open?vault=journal'"

# Billing
alias checkDevBilling='openFlyBilling && openOpenAIBilling && openAWSBilling'
