# ls
alias ls='ls -FGhl'
alias la='ls -A'
alias lS='la -S'
alias lSr='la -Sr'
alias lt='la -t'
alias ltr='la -rt'

# Python
alias python='winpty python.exe'
alias newvenv='rm -r venv; python -m venv venv; source venv/Scripts/activate'
alias makevenv='rm -r venv; python -m venv venv; source venv/Scripts/activate; pip install -r requirements.txt;  pip freeze  > requirements.txt'
alias runvenv='source venv/Scripts/activate; python run.py'
alias venvon='source venv/Scripts/activate'

# Git
alias gc='git commit'
alias gco='git checkout'
alias ga='git add'
