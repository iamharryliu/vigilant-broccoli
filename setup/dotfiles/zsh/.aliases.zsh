alias initsh='source ~/.zshrc'

# cd
alias ..='cd ..'
alias ..x2='cd ../..'
alias ..x3='cd ../../..'

# mkdir
alias mkdir='mkdir -pv'
alias mkcd='function _mkcd() { mkdir -p "$1" && cd "$1"; }; _mkcd'

# ls (mac)
alias ls='ls -FGhl'
alias la='ls -A'
alias lS='la -S'
alias lSr='la -Sr'
alias lt='la -t'
alias ltr='la -rt'

# Git
alias gs='git status'
alias gb='git branch'
alias gco='git checkout'
alias gbswitch='git checkout -'
alias gcob='git checkout -b'
alias gc='git commit -m'
alias gpush='git push'
alias greset='git reset HEAD^'
alias undocommit='greset --soft'
alias deletecommit='greset --hard'
alias droplocalbranches='git branch | grep -v "main" | xargs git branch -D'
alias dropremotebranches='git branch -r | grep -v "origin/main" | sed "s/origin\///" | xargs git push origin --delete'

# Github
alias updategitreadme="cdvb && git add iamharryliu/README.md && git commit -m 'docs: update github profile readme' && git subtree push --prefix=iamharryliu git@github.com:iamharryliu/iamharryliu.git main"

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

# Postgres
alias startbrewsql='brew services start postgresql'
alias stopbrewsql='brew services stop postgresql'
alias sqlstatus='pg_isready -h localhost -p 5432'

# Wrangler
alias wranglerdeploy='npx wrangler pages deploy'
alias wranglerdelete='npx wrangler pages delete'
alias wranglerls='npx wrangler pages project list'

# FlyIO
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

# Fly Postgres
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

# Other
alias deploypwui="cdnx && nx deploy personal-website-frontend --skip-nx-cache"
alias committodo="git add ~/vigilant-broccoli/TODO.md && git commit -m 'docs: update TODO.md'"
alias commitmd="cdvb && git add README.md TODO.md notes/**/*.md && git commit -m 'docs: update md files'"
