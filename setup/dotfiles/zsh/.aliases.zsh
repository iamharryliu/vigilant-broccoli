#
alias srcsh='source ~/.zshrc'

# cd
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'
alias .....='cd ../../../..'

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
alias makevenv='rm -r venv; python -m venv venv; source venv/bin/activate; pip install -r requirements.txt; pip freeze  > requirements.txt'
alias runvenv='source venv/bin/activate; python run.py'
alias venvon='source venv/bin/activate'

# Git
alias greset='git reset HEAD^'
alias undocommit='greset --soft'
alias deletecommit='greset --hard'

# Node
alias npmhard='rm -rf node_modules package-lock.json && npm i'
alias monorepo='cd ~/vigilant-broccoli'
alias cdfrontend='cd ~/vigilant-broccoli/projects/personal-website/frontend'
alias cdbackend='cd ~/vigilant-broccoli/projects/personal-website/backend'
