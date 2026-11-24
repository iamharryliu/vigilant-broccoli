export REPO_DIR=$HOME/vigilant-broccoli
export GIT_WORKFLOWS_DIR="$REPO_DIR/.github/workflows"
export DOCS_DIR="$REPO_DIR/docs"
export BRUNO_DIR="$REPO_DIR/bruno"
export SETUP_DIR="$REPO_DIR/setup"
export NOTES_DIR="$REPO_DIR/notes"
export LANGUAGE_LEARNING_DIR="$NOTES_DIR/hobbies/language-learning"
export TECH_NOTES_DIR="$NOTES_DIR/tech"
export SOFTWARE_NOTES_DIR="$TECH_NOTES_DIR/software"
export FOOD_NOTES_DIR="$NOTES_DIR/hobbies/cooking"
export PERSONAL_NOTES_DIR="$NOTES_DIR/personal"
export CAREER_NOTES_DIR="$NOTES_DIR/career"
export WORKFLOW_NOTES_DIR="$NOTES_DIR/workflows"
export TRAVEL_NOTES_DIR="$NOTES_DIR/travel"
export SNIPPETS_DIR="$REPO_DIR/snippets"
export PROJECTS_DIR="$REPO_DIR/projects"
export TODO_FILEPATH="$REPO_DIR/TODO.md"
export MAC_SETUP_DIR="$SETUP_DIR/mac"
export DOTFILES_DIR="$SETUP_DIR/dotfiles"
export COMMON_DOTFILES_DIR="$DOTFILES_DIR/common"
export ZSH_DOTFILES_DIR="$DOTFILES_DIR/zsh"
export AGENT_SKILLS_DIR="$DOTFILES_DIR/agent-skills"
export WORKSPACES_DIR="$SETUP_DIR/workspaces"

# Audit
alias finddotenv='find . -type f -name ".env" -exec realpath {} \;'
alias findclaude='find ~ -type d -name ".claude" -exec realpath {} \; 2>/dev/null'
alias fuzzyfinddotenv='find . -type f -name ".env*" -exec realpath {} \;'
alias gitleaksreport='gitleaks detect --report-path gitleaks-report.json'

quickzip() {
  zip -r "${1%/}.zip" "$1"
}
