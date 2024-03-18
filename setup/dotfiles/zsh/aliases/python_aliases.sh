
alias python=python3
alias newvenv='rm -r venv; python -m venv venv; source venv/bin/activate'
alias newvenv='deactivate; rm -r venv; python -m venv venv; source venv/bin/activate'
alias makevenv='deactivate; rm -r venv; python -m venv venv; source venv/bin/activate; pip install -r requirements.txt'
alias runvenv='source venv/bin/activate; python run.py'
alias venvon='source venv/bin/activate'
alias pipdump='pip freeze  > requirements.txt'
