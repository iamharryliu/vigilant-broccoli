alias python=python3

# Virtual Environment
alias newvenv='rm -r venv; python -m venv venv; source venv/bin/activate'
alias newvenv='deactivate; rm -r venv; python -m venv venv; source venv/bin/activate'
alias makevenv='if [ -d venv ]; then rm -r venv; fi; python -m venv venv; source venv/bin/activate; if [ -f requirements.txt ]; then pip install -r requirements.txt; else echo "No requirements.txt found, skipping installation."; fi;'
alias runvenv='source venv/bin/activate; python run.py'
alias venvon='source venv/bin/activate'
alias revenv='initsh && venvon'
alias pipdump='pip freeze  > requirements.txt'
pipreinstall() {
    pip uninstall "$1" -y && pip install "$1"
}

# Flask
alias flaskrun='venvon && flask --app app.py --debug run'
