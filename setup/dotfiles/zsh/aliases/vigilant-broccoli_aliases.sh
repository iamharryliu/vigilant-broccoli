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
alias dldjmusic="$NX_DIR/scripts/shell/run-spotify-to-mp3.sh --output '$HOME/resilio-sync/media/dj-music-library' --filter mix --parallel 5"
# One-way copy (no --delete) so removing a book in Apple Books keeps the Resilio copy.
alias syncbooks='rsync -a --progress "$HOME/Library/Mobile Documents/iCloud~com~apple~iBooks/Documents/" "$HOME/resilio-sync/media/books/"'

# Docker
alias dockercleanup="$REPO_DIR/setup/dotfiles/zsh/scripts/docker_cleanup.sh"

# Reclaim disk: Claude worktrees, Docker build cache/images, package-manager caches. Docker volumes are left alone.
localcleanup() {
    local worktrees_dir="$REPO_DIR/.claude/worktrees" worktree header
    local -a worktrees=() skipped=() remove_args=()
    local removed=0 worktree_kb=0 kb out size label cache_path
    local summary="" docker_note="" free_before="" free_after="" width=0 line disk_path
    local -a cache_entries=()
    # Cache directories and the volume holding user data differ between macOS and Linux.
    if [ -d /System/Volumes/Data ]; then
        disk_path=/System/Volumes/Data
        cache_entries=("Yarn cache|$HOME/Library/Caches/Yarn" "Cypress cache|$HOME/Library/Caches/Cypress" "pip cache|$HOME/Library/Caches/pip")
    else
        disk_path=/
        cache_entries=("Yarn cache|$HOME/.cache/yarn" "Cypress cache|$HOME/.cache/Cypress" "pip cache|$HOME/.cache/pip" "pnpm store|$HOME/.local/share/pnpm/store" "pnpm cache|$HOME/.cache/pnpm")
    fi
    case "${1:-}" in
        "") ;;
        --force|-f)
            [ "$#" -eq 1 ] || { echo "Usage: localcleanup [--force|-f]" >&2; return 1; }
            remove_args=(--force)
            ;;
        *)
            echo "Usage: localcleanup [--force|-f]" >&2
            return 1
            ;;
    esac
    # Keep unmatched globs harmless in zsh without changing the caller's options.
    if [ -n "${ZSH_VERSION:-}" ]; then
        setopt local_options nonomatch
    fi
    for worktree in "$worktrees_dir"/*/; do
        [ -d "$worktree" ] || continue
        worktrees+=("${worktree%/}")
    done

    if [ "${#remove_args[@]}" -gt 0 ]; then
        header="Claude worktrees to remove (including ones with uncommitted changes):"
    else
        header="Claude worktrees to remove (worktrees with uncommitted changes are skipped):"
    fi
    echo "$header"
    printf '  %s\n' "${worktrees[@]}"
    ask "Remove them${remove_args[*]:+ (uncommitted changes will be lost)}, prune Docker, and clear npm/Yarn/Cypress/pip caches?" || {
        echo "Cleanup canceled."
        return 0
    }

    free_before=$(df -h "$disk_path" | awk 'NR==2 {print $4}')

    for worktree in "${worktrees[@]}"; do
        kb=$(du -sk "$worktree" 2> /dev/null | cut -f1)
        if git -C "$REPO_DIR" worktree remove "${remove_args[@]}" "$worktree"; then
            removed=$((removed + 1))
            worktree_kb=$((worktree_kb + ${kb:-0}))
        else
            skipped+=("$(basename "$worktree")")
        fi
    done
    git -C "$REPO_DIR" worktree prune
    size=$(awk -v kb="$worktree_kb" 'BEGIN {
        if (kb >= 1048576) printf "%.1fG", kb / 1048576
        else if (kb >= 1024) printf "%.0fM", kb / 1024
        else printf "%dK", kb
    }')
    summary="Claude worktrees ($removed removed, ${#skipped[@]} skipped)	$size"

    if docker info &> /dev/null; then
        out=$(docker builder prune -af)
        size=$(printf '%s\n' "$out" | sed -n 's/^Total:[[:space:]]*//p' | tail -1)
        summary="$summary
Docker build cache	${size:-0B}"
        out=$(docker image prune -af)
        size=$(printf '%s\n' "$out" | sed -n 's/^Total reclaimed space:[[:space:]]*//p' | tail -1)
        summary="$summary
Docker unused images	${size:-0B}"
        out=$(docker container prune -f)
        size=$(printf '%s\n' "$out" | sed -n 's/^Total reclaimed space:[[:space:]]*//p' | tail -1)
        summary="$summary
Docker stopped containers	${size:-0B}"
    else
        docker_note="skipped (Docker not available)"
        summary="$summary
Docker build cache	$docker_note
Docker unused images	$docker_note
Docker stopped containers	$docker_note"
    fi

    for line in "npm cache|$HOME/.npm/_cacache" "npx cache|$HOME/.npm/_npx" "${cache_entries[@]}"; do
        label="${line%%|*}"
        cache_path="${line#*|}"
        size="-"
        if [ -e "$cache_path" ]; then
            size=$(du -sh "$cache_path" 2> /dev/null | cut -f1)
        fi
        summary="$summary
$label	${size:--}"
    done

    npm cache clean --force
    rm -rf ~/.npm/_npx
    for line in "${cache_entries[@]}"; do
        rm -rf "${line#*|}"
    done

    free_after=$(df -h "$disk_path" | awk 'NR==2 {print $4}')

    while IFS=$'\t' read -r label size; do
        [ "${#label}" -gt "$width" ] && width=${#label}
    done <<< "$summary"
    echo
    echo "Reclaimed:"
    while IFS=$'\t' read -r label size; do
        printf '  %-*s  %s\n' "$width" "$label" "$size"
    done <<< "$summary"
    for worktree in "${skipped[@]}"; do
        echo "  Skipped worktree: $worktree (uncommitted changes)"
    done
    echo "Disk free: $free_before before -> $free_after after"
    if [ "$disk_path" = /System/Volumes/Data ]; then
        echo "Note: freed Docker space lives in Docker Desktop's VM disk, so macOS free space may grow by less until that disk shrinks."
    fi
}

# Cheatsheet
cheatsheet() {
    "$REPO_DIR/scripts/shell/cheatsheet-aliases.sh"
}
