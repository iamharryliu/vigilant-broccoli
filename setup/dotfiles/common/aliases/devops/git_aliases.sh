alias gs='git status'
alias gb='git branch'
alias gco='git checkout'
alias gbswitch='git checkout -'
alias gcob='git checkout -b'
alias gcm='git commit -m'
alias gpush='git push'
alias gpull='git pull --autostash --rebase'
alias grebase='git rebase'
alias greset='git reset HEAD^'
alias undocommit='greset --soft'
alias deletecommit='greset --hard'
alias removefromstaged='git restore --staged .'
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
