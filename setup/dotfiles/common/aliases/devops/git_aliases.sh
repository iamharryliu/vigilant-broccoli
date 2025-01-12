alias gs='git status'

# Branch Aliases
alias gb='git branch | nl -w 2 -s ". "'
alias gbd='git branch -D'

validate_branch_number() {
  local branch_number=$1
  if [[ -z $branch_number || $branch_number -le 0 ]]; then
    echo "Please provide a valid branch number (starting from 1)."
    return 1
  fi
}

get_branch_by_number() {
  local branch_number=$1
  validate_branch_number "$branch_number" || return 1

  local branch_name
  branch_name=$(git branch --list | sed -E 's/^[* ]*//' | sed -n "${branch_number}p")

  if [[ -n $branch_name ]]; then
    echo "$branch_name"
  else
    echo "Branch number $branch_number does not exist."
    return 1
  fi
}

# Copy branch name to clipboard
cpgbn() {
  local branch_number=$1
  local branch_name
  branch_name=$(get_branch_by_number "$branch_number") || return 1

  if command -v pbcopy &>/dev/null; then
    echo "$branch_name" | pbcopy
    echo "Branch name '$branch_name' copied to clipboard (macOS)."
  elif command -v xclip &>/dev/null; then
    echo "$branch_name" | xclip -selection clipboard
    echo "Branch name '$branch_name' copied to clipboard (Linux)."
  elif command -v wl-copy &>/dev/null; then
    echo "$branch_name" | wl-copy
    echo "Branch name '$branch_name' copied to clipboard (Wayland)."
  elif command -v powershell.exe &>/dev/null; then
    echo "$branch_name" | powershell.exe Set-Clipboard
    echo "Branch name '$branch_name' copied to clipboard (Windows PowerShell)."
  else
    echo "Clipboard utility not found. Install 'pbcopy', 'xclip', 'wl-copy', or use PowerShell."
  fi
}

# Remove branch by number
rmgbn() {
  local branch_number=$1
  local branch_name
  branch_name=$(get_branch_by_number "$branch_number") || return 1

  if ask "Are you sure you want to delete the branch: $branch_name?"; then
    echo "Deleting branch: $branch_name"
    git branch -D "$branch_name"
  else
    echo "Branch deletion canceled."
    return 0
  fi
}


alias droplocalbranches='git branch | grep -v "main" | xargs git branch -D'
alias dropremotebranches='git branch -r | grep -v "origin/main" | sed "s/origin\///" | xargs -I {} git push origin --delete {} && git fetch -p'

# Checkout Aliases
alias gco='git checkout'
alias gcob='gco -b'
alias gco-='gco -'
gcon() {
  local branch_number=$1
  local branch_name
  branch_name=$(get_branch_by_number "$branch_number") || return 1

  echo "Checking out branch: $branch_name"
  gco "$branch_name"
}

# Staging
alias gstageall='git add .'
alias gcm='git commit -m'
alias gstash='git stash'
alias gpop='gstash pop'
alias gamend='git commit --amend'
alias greset='git reset HEAD^'
alias undocommit='greset --soft'
alias deletecommit='greset --hard'
alias removefromstaged='git restore --staged .'
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
    commit_message+="\n\n$body"
  fi

  # Append the ticket footer if provided
  if [ -n "$ticket_footer" ]; then
    commit_message+="\n\ncloses: $ticket_footer"
  fi

  echo -e "$commit_message" | git commit -F -
}

# Push / Pull
alias gpush='git push'
alias gpushf='gpush --force'
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

function pushreadme() {
    pushfile "README.md" "Update README.md"
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

alias gpull='git pull --autostash --rebase'
alias gpo='gpull origin'
alias grebase='git rebase'

# Tags
alias gtagls='git tag'
alias rmgtag='git tag -d'
