# Code Workspaces
alias openvbws="code $HOME/Workspaces/vb.code-workspace"
alias openworkws="code $HOME/Workspaces/work.code-workspace"

# Journal
ICLOUD_JOURNAL_DIR="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/journal"
HOME_JOURNAL_DIR="$HOME/journal"
if [ -d "$ICLOUD_JOURNAL_DIR" ]; then
    JOURNAL_DIR="$ICLOUD_JOURNAL_DIR"
else
    JOURNAL_DIR="$HOME_JOURNAL_DIR"
fi
alias cdjournal="cd '$JOURNAL_DIR'"
alias pushJournal="cdjournal && git add . && gc docs 'Update journal.' && gpush"
alias pulljournal="cdjournal && gpull"

# VB
PROJECTS_DIR="$REPO_DIR/projects"
GRIND75_DIR="$PROJECTS_DIR/grind-75"
NX_DIR="$PROJECTS_DIR/nx-workspace"
# Directory
alias cdvb="cd $REPO_DIR"
alias cdprojects="cd $PROJECTS_DIR"
alias cdgrind75="cd $GRIND75_DIR"
alias cdgrind75ts="cdgrind75 && cd typescript"
alias cdgrind75py="cdgrind75 && cd python"
alias cdgrind75go="cdgrind75 && cd go"
alias pushleetcode="git add $GRIND75_DIR && gc feat leetcode 'Update leetcode.' && gpush"
alias cdnx="cd $NX_DIR"

# Github
alias gitme='chrome "https://github.com/iamharryliu"'
alias pushghreadme="cd $HOME/iamharryliu && gpull && git add README.md && gc docs github-readme 'Update Github profile README.md' && gpush"
# vigilant-broccoli
alias pullvb="cd $REPO_DIR && gpull"
alias pullall='pulljournal && pullvb'
alias vbgit='chrome "https://github.com/iamharryliu/vigilant-broccoli"'
alias vbactions='chrome "https://github.com/iamharryliu/vigilant-broccoli/actions"'
alias vbnpm='open "https://www.npmjs.com/settings/vigilant-broccoli/packages"'
# vb push
alias pushdocs="cdvb && git add $DOCS_DIR && gc docs notes 'Update Markdown docs.' && gpush"
alias pushnotes="cdvb && git add $NOTES_DIR && gc docs notes 'Update Markdown notes.' && gpush"
alias pushvbtodo="cdvb && git add $TODO_FILEPATH && gc docs todo 'Update TODO.md file.' && gpush"
alias pushsnippets="cdvb && git add $SNIPPETS_DIR && gc docs snippets 'Update snippets.' && gpush"
alias pushprogress="git add $SNIPPETS_DIR/progress.md && gc docs progress 'Update progress.md file.' && gpush"
alias pushactions="cdvb && git add $GIT_WORKFLOWS_DIR && gc build github-actions 'Update Github actions.' && gpush"
alias pushsetup="cdvb && git add $SETUP_DIR && gc feat setup 'Update setup scripts.' && gpush"
alias pushdotfiles="cdvb && git add $DOTFILES_DIR && gc feat dotfiles 'Update dotfiles.' && gpush"
# Homebrew
alias brewdump="rm $MAC_SETUP_DIR/Brewfile && brew bundle dump --file=$MAC_SETUP_DIR/Brewfile"
alias pushbrew="cdvb && git add $MAC_SETUP_DIR/Brewfile && gc feat brew 'Update Brewfile.' && gpush"
# Projects
# Secrets Manager
alias pushsecretsmanager="cdvb && git add $PROJECTS_DIR/secret-manager/ && gc build secrets-manager 'Update secrets manager.' && gpush"
# harryliu.dev
alias servehld="cdnx && nx serve personal-website-frontend"
alias servepersonalfrontend="cdnx && npm run serve:personal-website"
alias deploypersonalfrontend="cdnx && nx manual-deploy personal-website-frontend"
alias pushpagecontent="cdnx && git add apps/ui/personal-website-frontend/src/assets/site-content/ && gc feat personal-website 'Update site content.' && gpush"

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
alias pushc8scontent="cdnx && git add apps/ui/cloud-8-skate-angular/src/assets/site-content/ && gc feat cloud8skate 'Update site content.' && gpush"
# DJ Stuff
alias pushdj='cdvb && git subtree push --prefix=scripts/python/dj-scripts/spotify-to-mp3 git@github.com:iamharryliu/spotify-to-mp3.git main'
alias dldjmusic="cd $REPO_DIR/scripts/python/dj-scripts/spotify-to-mp3 && source venv/bin/activate && python download_music.py --output '/Users/harryliu/My Drive/DJ Music Library' --filter 'mix'"

## Obsidian
alias openNotes="open 'obsidian://open?vault=notes'"
alias openJournal="open 'obsidian://open?vault=journal'"

# Billing
alias checkDevBilling='openFlyBilling && openOpenAIBilling && openAWSBilling'

# Employee Handler
alias npmEmployeeHandler="npm i $PROJECTS_DIR/nx-workspace/dist/libs/@vigilant-broccoli/employee-handler"
alias buildEmployeeHandler="nnx build @vigilant-broccoli/employee-handler"

alias vbgcpconsole="open 'https://console.cloud.google.com/welcome?hl=en&project=vigilant-broccoli'"
alias vbgcpfirewall="open 'https://console.cloud.google.com/net-security/firewall-manager/firewall-policies/list?project=vigilant-broccoli'"
alias sshvbvm="ssh harryliu@10.0.1.1"
alias vbvault="open 'https://10.0.1.1:8200'"
# alias sshvbvm="gcloud compute ssh --zone 'us-east1-b' 'vb-free-vm' --project 'vigilant-broccoli'"
# alias sshtunnelvault="sshvbvm -- -f -L8200:127.0.0.1:8200 -N"
# alias openvbvault="sshtunnelvault; openlocalvault"

# Backup
alias vbbackupsecrets="cdnx && npx tsx scripts/backup-vault-secrets.ts && cd -"