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
alias ga.='git add .'
alias gc='git commit'
alias gac='ga. && gc'
alias gcnv='git commit --no-verify'
alias gco='git checkout'
alias ga='git add'
