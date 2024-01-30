alias initsh='source ~/.zshrc'

# cd
alias ..='cd ..'
alias ..x2='cd ../..'
alias ..x3='cd ../../..'

# mkdir
alias mkdir='mkdir -pv'

# ls (mac)
alias ls='ls -FGhl'
alias la='ls -A'
alias lS='la -S'
alias lSr='la -Sr'
alias lt='la -t'
alias ltr='la -rt'

# Python
alias python=python3
alias newvenv='rm -r venv; python -m venv venv; source venv/bin/activate'
alias makevenv='rm -r venv; python -m venv venv; source venv/bin/activate; pip install -r requirements.txt'
alias runvenv='source venv/bin/activate; python run.py'
alias venvon='source venv/bin/activate'
alias pipdump='pip freeze  > requirements.txt'

# Git
alias greset='git reset HEAD^'
alias undocommit='greset --soft'
alias deletecommit='greset --hard'
alias dropbranches='git branch | grep -v "main" | xargs git branch -D'

# Node
alias initnpm='rm -rf node_modules package-lock.json && npm i'
alias initnpmserve='initnpm && npm run serve'

# Repo Navigation
alias cdvb='cd ~/vigilant-broccoli/'
alias cdpw='cd ~/vigilant-broccoli/projects/personal-website/'
alias cdsb='cd ~/vigilant-broccoli/projects/sandbox/'
alias cdnx='cd ~/vigilant-broccoli/projects/nx-workspace/'

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

# Brew
alias brewdump='rm ~/vigilant-broccoli/setup/mac/Brewfile && brew bundle dump --file=~/vigilant-broccoli/setup/mac/Brewfile'
