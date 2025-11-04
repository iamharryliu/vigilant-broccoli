export REPO_DIR=$HOME/vigilant-broccoli
export GIT_WORKFLOWS_DIR="$REPO_DIR/.github/workflows"
export DOCS_DIR="$REPO_DIR/docs"
export SETUP_DIR="$REPO_DIR/setup"
export NOTES_DIR="$REPO_DIR/notes"
export LANGUAGE_LEARNING_DIR="$NOTES_DIR/hobbies/language-learning"
export SNIPPETS_DIR="$REPO_DIR/snippets"
export PROJECTS_DIR="$REPO_DIR/projects"
export TODO_FILEPATH="$REPO_DIR/TODO.md"
export MAC_SETUP_DIR="$SETUP_DIR/mac"
export DOTFILES_DIR="$SETUP_DIR/dotfiles"
export COMMON_DOTFILES_DIR="$DOTFILES_DIR/common"
export ZSH_DOTFILES_DIR="$DOTFILES_DIR/zsh"

# Audit
alias finddotenv='find . -type f -name ".env"'
alias fuzzyfinddotenv='find . -type f -name ".env*"'
alias gitleaksreport='gitleaks detect --report-path gitleaks-report.json'
