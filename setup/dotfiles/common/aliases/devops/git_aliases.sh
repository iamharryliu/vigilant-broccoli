alias gs='git status'
alias gb='git branch | nl -w 2 -s ". "'
alias gbd='git branch -D'
alias gco='git checkout'
alias gbswitch='git checkout -'
alias gcob='git checkout -b'
alias gstageall='git add .'
alias gcm='git commit -m'
alias gstash='git stash'
alias gpop='gstash pop'
alias gpush='git push'
alias gpushf='gpush --force'
alias gpull='git pull --autostash --rebase'
alias gpo='gpull origin'
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

get_branch_by_number() {
  local branch_number=$1
  if [[ -z $branch_number || $branch_number -le 0 ]]; then
    echo "Please provide a valid branch number (starting from 1)."
    return 1
  fi

  # Get the branch name based on the given number
  local branch_name=$(git branch --list | sed 's/^[* ]*//' | sed -n "${branch_number}p")

  if [[ -n $branch_name ]]; then
    echo "$branch_name"
  else
    echo "Branch number $branch_number does not exist."
    return 1
  fi
}

gcobn() {
  local branch_number=$1

  if [[ -z $branch_number || $branch_number -le 0 ]]; then
    echo "Please provide a valid branch number (starting from 1)."
    return 1
  fi

  local branch_name
  branch_name=$(get_branch_by_number "$branch_number")

  if [[ $? -ne 0 || -z $branch_name ]]; then
    echo "Failed to retrieve the branch name for number $branch_number."
    return 1
  fi

  echo "Checking out branch: $branch_name"
  git checkout "$branch_name"
}

gbrm() {
  local branch_number=$1

  # Validate input
  if [[ -z $branch_number || $branch_number -le 0 ]]; then
    echo "Please provide a valid branch number (starting from 1)."
    return 1
  fi

  # Get the branch name using get_branch_by_number
  local branch_name
  branch_name=$(get_branch_by_number "$branch_number")

  if [[ $? -ne 0 || -z $branch_name ]]; then
    echo "Failed to retrieve the branch name for number $branch_number."
    return 1
  fi

  # Confirm deletion with the user
  echo "Are you sure you want to delete the branch: $branch_name? [y/N]"
  read -r confirmation
  if [[ $confirmation != "y" && $confirmation != "Y" ]]; then
    echo "Branch deletion canceled."
    return 0
  fi

  # Delete the branch
  echo "Deleting branch: $branch_name"
  git branch -D "$branch_name"
}

gbcp() {
  local branch_number=$1

  if [[ -z $branch_number || $branch_number -le 0 ]]; then
    echo "Please provide a valid branch number (starting from 1)."
    return 1
  fi

  local branch_name
  branch_name=$(get_branch_by_number "$branch_number")

  if [[ $? -ne 0 || -z $branch_name ]]; then
    echo "Failed to retrieve the branch name for number $branch_number."
    return 1
  fi

  # Copy branch name to clipboard
  if command -v pbcopy &> /dev/null; then
    echo "$branch_name" | pbcopy
    echo "Branch name '$branch_name' copied to clipboard (macOS)."
  elif command -v xclip &> /dev/null; then
    echo "$branch_name" | xclip -selection clipboard
    echo "Branch name '$branch_name' copied to clipboard (Linux)."
  elif command -v wl-copy &> /dev/null; then
    echo "$branch_name" | wl-copy
    echo "Branch name '$branch_name' copied to clipboard (Wayland)."
  else
    echo "Clipboard utility not found. Install 'pbcopy', 'xclip', or 'wl-copy' to enable copying to clipboard."
  fi
}



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
