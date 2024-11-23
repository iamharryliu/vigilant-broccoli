alias gs='git status'
alias gb='git branch'
alias gbd='git branch -D'
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
alias dropremotebranches='git branch -r | grep -v "origin/main" | sed "s/origin\///" | xargs -I {} git push origin --delete {} && git fetch -p'
# Tags
alias gtagls='git tag'
alias rmgtag='git tag -d'

# TODO: Enhance later to handle the scope better
function gc() {
  if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <git_type> [<project>] <message> [<footer>] [<body>]"
    return 1
  fi

  git_type="$1"
  project=""
  message=""
  ticket_footer=""
  body=""
  echo $2
  if [[ "$2" =~ \  ]]; then
    message="$2"
    if [ "$#" -ge 3 ]; then
      ticket_footer="$3"
    fi
    if [ "$#" -ge 4 ]; then
      body="$4"
    fi
    commit_message="$git_type: $message"
  else
    # Treat it as the project if not quoted
    if [ "$#" -ge 5 ]; then
      project="$2"
      message="$3"
      ticket_footer="$4"
      body="$5"
      commit_message="$git_type($project): $message"
    elif [ "$#" -eq 4 ]; then
      project="$2"
      message="$3"
      ticket_footer="$4"
      commit_message="$git_type($project): $message"
    elif [ "$#" -eq 3 ]; then
      project="$2"
      message="$3"
      commit_message="$git_type($project): $message"
    else
      message="$2"
      commit_message="$git_type: $message"
    fi
  fi

  # Append the body if provided
  if [ -n "$body" ]; then
    commit_message="$commit_message

$body"
  fi

  # Append the ticket footer if provided
  if [ -n "$ticket_footer" ]; then
    commit_message="$commit_message

closes: $ticket_footer"
  fi

  git commit -m "$commit_message"
  echo "$commit_message"
}



function pushfile() {
    local filename=$1
    local message=$2
    find . -name "$filename" | while read -r filepath; do
        git add $filepath
        git commit -m "$message"
        git push
        cd - >/dev/null || exit
    done
}
function pushignore() {
    pushfile ".gitignore" "Update .gitignore"
}

function pushtodo() {
    pushfile "TODO.md" "Update TODO.md file."
}

function pushcron() {
    pushfile "crontab" "Update crontab."
}
