# Journal
JOURNAL_DIR="$HOME/journal"
alias cdjournal="cd '$JOURNAL_DIR'"
pushjournal() {
  pushd "$JOURNAL_DIR" > /dev/null || return 1
  git add . && gc docs 'Update journal.' && gpush
  popd > /dev/null
}
alias pulljournal="cdjournal && gpull"

# VB
PROJECTS_DIR="$REPO_DIR/projects"
GRIND75_DIR="$PROJECTS_DIR/grind-75"
export NX_DIR="$PROJECTS_DIR/nx-workspace"
# Directory
alias cdvb="cd $REPO_DIR"
alias cdprojects="cd $PROJECTS_DIR"
alias cdgrind75="cd $GRIND75_DIR"
alias cdgrind75ts="cdgrind75 && cd typescript"
alias cdgrind75py="cdgrind75 && cd python"
alias cdgrind75go="cdgrind75 && cd go"
alias pushleetcode="git add $GRIND75_DIR && gc feat leetcode 'Update leetcode.' && gpush"
alias cdnx="cd $NX_DIR"

# Github
alias vbactions="cdvb && npm run open:repo:actions"
alias vbnpm="cdvb && npm run npm:packages"
# vb push
alias pushbruno="cdvb && git add $BRUNO_DIR && gc docs bruno 'Update Bruno collections.' && gpush"
alias pushdocs="cdvb && git add $DOCS_DIR && gc docs notes 'Update Markdown docs.' && gpush"
alias pushnotes="cdvb && git add $NOTES_DIR && gc docs notes 'Update Markdown notes.' && gpush"
alias pushvbtodo="cdvb && git add $TODO_FILEPATH && gc docs todo 'Update TODO.md file.' && gpush"
alias pushsnippets="cdvb && git add $SNIPPETS_DIR && gc docs snippets 'Update snippets.' && gpush"
alias pushactions="cdvb && git add $GIT_WORKFLOWS_DIR && gc ci github-actions 'Update Github actions.' && gpush"
alias pushsetup="cdvb && git add $SETUP_DIR && gc feat setup 'Update setup scripts.' && gpush"
alias pushdotfiles="cdvb && git add $DOTFILES_DIR && gc feat dotfiles 'Update dotfiles.' && gpush"
# Grind 75
alias testgrind75py="python -m unittest discover -s $GRIND75_DIR/python"
alias testgrind75ts="cdgrind75ts && npx jest $GRIND75_DIR/typescript"
alias testgrind75go="go test $GRIND75_DIR/..."
alias testgrind75="testgrind75py && testgrind75ts && testgrind75go"

# OCI VM
sshocivm() {
  ssh -i ~/.ssh/id_ed25519 ubuntu@$(cd $REPO_DIR/infrastructure/terraform && terraform output -raw oci_vm_public_ip 2>/dev/null) "$@"
}

# Tmux
alias tmuxvb="$REPO_DIR/setup/dotfiles/common/scripts/tmux-vb.sh"
alias neovidetmuxvb='neovide -- -c "terminal tmux attach -t vb || ~/vigilant-broccoli/setup/dotfiles/common/scripts/tmux-vb.sh" -c "startinsert"'

# WireGuard
alias wg0-up='sudo wg-quick up wg0'
alias wg0-down='sudo wg-quick down wg0'
alias vb-up='sudo wg-quick up vb'
alias vb-down='sudo wg-quick down vb'
alias wg-status='sudo wg show'

# Vault
alias vbvault="open 'https://10.0.1.1:8200'"
alias cpvaulttoken="gcloud secrets versions access latest --secret=VB_VM_VAULT_ROOT_TOKEN --project=vigilant-broccoli | pbcopy && echo 'Vault root token copied to clipboard.'"
alias vbbackup='$NX_DIR/scripts/shell/backup-secrets.sh && $NX_DIR/scripts/shell/backup-repo.sh'

# Hobby Code
alias dldjmusic="$NX_DIR/scripts/shell/run-spotify-to-mp3.sh --output '$HOME/Library/CloudStorage/GoogleDrive-harryliu1995@gmail.com/My Drive/DJ Music Library' --filter mix --parallel 5"
# One-way copy (no --delete) so removing a book in Apple Books keeps the Drive backup.
alias syncbooks='rsync -a --progress "$HOME/Library/Mobile Documents/iCloud~com~apple~iBooks/Documents/" "$HOME/Library/CloudStorage/GoogleDrive-harryliu1995@gmail.com/My Drive/Books/"'

# Docker
alias dockercleanup="$REPO_DIR/setup/dotfiles/zsh/scripts/docker_cleanup.sh"

# Reclaim disk: Claude worktrees, Docker build cache/images, package-manager caches. Docker volumes are left alone.
localcleanup() {
    local worktrees_dir="$REPO_DIR/.claude/worktrees" worktree
    local -a worktrees=()
    # Keep unmatched globs harmless in zsh without changing the caller's options.
    if [ -n "${ZSH_VERSION:-}" ]; then
        setopt local_options nonomatch
    fi
    for worktree in "$worktrees_dir"/*/; do
        [ -d "$worktree" ] || continue
        worktrees+=("${worktree%/}")
    done

    echo "Claude worktrees to remove (worktrees with uncommitted changes are skipped):"
    printf '  %s\n' "${worktrees[@]}"
    ask "Remove them, prune Docker, and clear npm/Yarn/Cypress/pip caches?" || {
        echo "Cleanup canceled."
        return 0
    }

    for worktree in "${worktrees[@]}"; do
        git -C "$REPO_DIR" worktree remove "$worktree" || echo "  Skipped $worktree"
    done
    git -C "$REPO_DIR" worktree prune

    if docker info &> /dev/null; then
        docker builder prune -af
        docker image prune -af
        docker container prune -f
    fi

    npm cache clean --force
    rm -rf ~/.npm/_npx ~/Library/Caches/{Yarn,Cypress,pip}
    if [ -d /System/Volumes/Data ]; then
        df -h /System/Volumes/Data
    fi
}

# Cheatsheet
cheatsheet() {
    "$REPO_DIR/scripts/shell/cheatsheet-aliases.sh"
}
