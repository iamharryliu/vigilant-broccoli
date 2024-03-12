alias initsh='source ~/.zshrc'

# Quick Links
alias opengmail='open -a "Google Chrome" "https://gmail.com/"'
alias openyoutube='open -a "Google Chrome" "https://www.youtube.com/"'
alias openudemy='open -a "Google Chrome" "https://www.udemy.com/"'
alias openmemrise='open -a "Google Chrome" "https://app.memrise.com/dashboard"'
alias openamazon='open -a "Google Chrome" "https://www.amazon.ca/"'
alias openchatgpt='open -a "Google Chrome" "https://chat.openai.com/"'
alias google="~/shell-scripts/google_search.sh"
alias youtube="~/shell-scripts/youtube_search.sh"
alias amazon="~/shell-scripts/amazon_search.sh"

# dir commands
alias ..='cd ..'
alias ..x2='cd ../..'
alias ..x3='cd ../../..'
alias mkdir='mkdir -pv'
alias mkcd='function _mkcd() { mkdir -p "$1" && cd "$1"; }; _mkcd'
alias ls='ls -FGhl'
alias la='ls -A'
alias lS='la -S'
alias lSr='la -Sr'
alias lt='la -t'
alias ltr='la -rt'

# git
alias gs='git status'
alias gb='git branch'
alias gco='git checkout'
alias gbswitch='git checkout -'
alias gcob='git checkout -b'
alias gcm='git commit -m'
alias gpush='git push'
alias gpull='git pull'
alias grebase='git rebase'
alias greset='git reset HEAD^'
alias undocommit='greset --soft'
alias deletecommit='greset --hard'
alias droplocalbranches='git branch | grep -v "main" | xargs git branch -D'
alias dropremotebranches='git branch -r | grep -v "origin/main" | sed "s/origin\///" | xargs git push origin --delete'
# conventional commit
function gc() {
  if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <git_type> [<project>] <message>"
    exit 1
  fi
  git_type="$1"
  project=""
  message=""
  if [ "$#" -eq 3 ]; then
    project="$2"
    message="$3"
    commit_message="$git_type($project): $message"
  else
    project=""
    message="$2"
    commit_message="$git_type: $message"
  fi
  git commit -m "$commit_message"
  echo "$commit_message"
}

# Port
killport() {
  if [ -z "$1" ]; then
    echo "Usage: killport <port>"
    return 1
  fi

  local port="$1"
  local pid=$(lsof -t -i :$port)

  if [ -z "$pid" ]; then
    echo "No process found on port $port"
  else
    echo "Killing process $pid running on port $port"
    kill -9 "$pid"
  fi
}

# Python
alias python=python3
alias newvenv='rm -r venv; python -m venv venv; source venv/bin/activate'
alias makevenv='rm -r venv; python -m venv venv; source venv/bin/activate; pip install -r requirements.txt'
alias runvenv='source venv/bin/activate; python run.py'
alias venvon='source venv/bin/activate'
alias pipdump='pip freeze  > requirements.txt'

# Node
alias initnpm='rm -rf node_modules package-lock.json && npm i'
alias initnpmserve='initnpm && npm run serve'
alias mynpmpackages='open -a "Google Chrome" "https://www.npmjs.com/settings/prettydamntired/packages"'

# Postgres
alias startbrewsql='brew services start postgresql'
alias stopbrewsql='brew services stop postgresql'
alias sqlstatus='pg_isready -h localhost -p 5432'

# MongoDB
alias mongodashboard='open -a "Google Chrome" "https://cloud.mongodb.com/v2/"'

# Wrangler
alias wranglerls='npx wrangler pages project list'
alias wranglerdeploy='npx wrangler pages deploy'
alias wranglerdelete='npx wrangler pages delete'

# FlyIO
alias flydashboard='open -a "Google Chrome" "https://fly.io/dashboard"'
alias flyls='fly apps list'
alias flyopen='fly apps open --app'
alias flydestroy='fly apps destroy'
alias flystatus='flyctl status --app'
alias flymachinestatus='flyctl machine status'
alias startflymachine='flyctl machine start --app'
alias stopflymachine='flyctl machine stop --app'
alias flyscalecount='flyctl scale count'
alias flylogs='flyctl logs --app'
alias flyssh='fly ssh console --app'
alias flycreatetoken='flyctl tokens create deploy --app'
# Postgres
alias flysqlconn='flyctl postgres connect --app'
alias flysqlproxy='flyctl proxy 5432 --app'
alias flysqlconntestdb='flyctl postgres connect --app testsql'
alias flysqlproxytestdb='flyctl proxy 5432 --app testsql'

# AWS
alias awsauto="aws --cli-auto-prompt"
alias startec2="aws ec2 start-instances --instance-ids $ec2_instance"
alias stopec2="aws ec2 stop-instances --instance-ids $ec2_instance"
alias sshec2="ssh -i ~/certs/ec2-instance.pem $ec2_instance_username_ip_address"

# NX
alias nxbuild="cdnx && nx build --skip-nx-cache"
alias nxdeploy="cdnx && nx deploy --skip-nx-cache"
alias nxbuildall="cdnx nx run-many -t=build"
alias nxdeployall="cdnx nx run-many -t=deploy"

# vigilant-broccoli
alias brewdump='rm ~/vigilant-broccoli/setup/mac/Brewfile && brew bundle dump --file=~/vigilant-broccoli/setup/mac/Brewfile'
alias cdvb='cd ~/vigilant-broccoli/'
alias cdnx='cd ~/vigilant-broccoli/projects/nx-workspace/'
alias grind75='python -m unittest discover -s ~/vigilant-broccoli/projects/grind-75'
alias committodo="cdvb && git add TODO.md && git commit -m 'docs: update TODO.md'"
alias commitdotfiles="cdvb && git add setup/dotfiles && git commit -m 'docs: update TODO.md'"
alias commitjournal="git add ~/journal/ && git commit -m 'docs: update journal'"
alias commitmd="cdvb && git add README.md TODO.md snippets/*.md notes/**/*.md && gc docs 'update md files'"
alias commitaliases="cdvb && git add setup/dotfiles/zsh/.aliases.zsh && gc feat aliases 'update .aliases.zsh'"

# Github
alias updategitreadme="cd ~/iamharryliu && git add . && git commit -m 'docs: update github profile readme' && git push"
alias openvb='open -a "Google Chrome" "https://github.com/iamharryliu/vigilant-broccoli"'
alias openvbactions='open -a "Google Chrome" "https://github.com/iamharryliu/vigilant-broccoli/actions"'


# harryliu.design
alias servepw='cdnx && npm run serve:personal-website'
alias deploypwui="cdnx && nx deploy personal-website-frontend --skip-nx-cache"

# Journal
alias pushJournal="cd ~/journal && git add . && git commit -m 'docs: update journal' && git push"
