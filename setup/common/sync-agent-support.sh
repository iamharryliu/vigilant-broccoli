#!/bin/bash
set -euo pipefail

MODE=${1:---sync}
if [ "$#" -gt 1 ] || { [ "$MODE" != --sync ] && [ "$MODE" != --check ] && [ "$MODE" != --clean ]; }; then
    echo 'Usage: bash setup/common/sync-agent-support.sh [--sync|--check|--clean]' >&2
    exit 2
fi

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$REPO_ROOT"
INVENTORY=$(mktemp)
trap 'rm -f "$INVENTORY"' EXIT
git ls-files --cached --others --exclude-standard -z -- \
    'CONTEXT.md' '**/CONTEXT.md' \
    'AGENTS.md' '**/AGENTS.md' 'CLAUDE.md' '**/CLAUDE.md' \
    'setup/dotfiles/.claude/commands/*.md' > "$INVENTORY"
git ls-files --others --ignored --exclude-standard --directory --no-empty-directory -z -- \
    'AGENTS.md' '**/AGENTS.md' 'CLAUDE.md' '**/CLAUDE.md' \
    'setup/dotfiles/.claude/commands/*.md' >> "$INVENTORY"
STATUS=0

if [ "$MODE" = --clean ]; then
    while IFS= read -r -d '' entry; do
        [ -L "$entry" ] || continue
        case "$entry" in
            setup/dotfiles/.claude/commands/*.md)
                skill_name=${entry##*/}
                target="../../agent-skills/${skill_name%.md}/SKILL.md"
                ;;
            AGENTS.md|CLAUDE.md|*/AGENTS.md|*/CLAUDE.md) target=CONTEXT.md ;;
            *) continue ;;
        esac
        if [ "$(readlink "$entry")" = "$target" ]; then
            rm "$entry"
            printf 'Removed generated adapter: %s\n' "$entry"
        fi
    done < "$INVENTORY"
    exit 0
fi

sync_link() {
    local target=$1
    local destination=$2
    if [ -L "$destination" ] && [ "$(readlink "$destination")" = "$target" ]; then
        return
    fi
    if [ "$MODE" = --check ]; then
        printf 'Expected %s -> %s\n' "$destination" "$target" >&2
        STATUS=1
    elif [ -e "$destination" ] && [ ! -L "$destination" ]; then
        printf 'Preserved non-symlink entry: %s\n' "$destination" >&2
        STATUS=1
    else
        mkdir -p "$(dirname "$destination")"
        ln -sfn "$target" "$destination"
        printf '%s -> %s\n' "$destination" "$target"
    fi
}

CONTEXT_COUNT=0
while IFS= read -r -d '' entry; do
    [ "${entry##*/}" = CONTEXT.md ] || continue
    [ -f "$entry" ] || continue
    if [ -L "$entry" ]; then
        printf 'Context source must be a regular file: %s\n' "$entry" >&2
        STATUS=1
        continue
    fi
    CONTEXT_COUNT=$((CONTEXT_COUNT + 1))
    for adapter in AGENTS.md CLAUDE.md; do
        sync_link CONTEXT.md "$(dirname "$entry")/$adapter"
    done
done < "$INVENTORY"

if [ "$CONTEXT_COUNT" -eq 0 ]; then
    echo 'No CONTEXT.md sources found.' >&2
    STATUS=1
fi

for skill_file in setup/dotfiles/agent-skills/*/SKILL.md; do
    [ -f "$skill_file" ] || continue
    skill_name=${skill_file%/SKILL.md}
    skill_name=${skill_name##*/}
    sync_link "../../agent-skills/$skill_name/SKILL.md" "setup/dotfiles/.claude/commands/$skill_name.md"
done

while IFS= read -r -d '' entry; do
    [ -e "$entry" ] || [ -L "$entry" ] || continue
    case "$entry" in
        setup/dotfiles/.claude/commands/*.md)
            skill_name=${entry##*/}
            source_file="setup/dotfiles/agent-skills/${skill_name%.md}/SKILL.md"
            ;;
        AGENTS.md|CLAUDE.md|*/AGENTS.md|*/CLAUDE.md)
            source_file="$(dirname "$entry")/CONTEXT.md"
            ;;
        *) continue ;;
    esac
    if [ ! -f "$source_file" ]; then
        printf 'Adapter has no source; remove or migrate it: %s\n' "$entry" >&2
        STATUS=1
    fi
done < "$INVENTORY"

if [ "$STATUS" -eq 0 ]; then
    printf 'Agent adapters are current (%s context sources).\n' "$CONTEXT_COUNT"
fi
exit "$STATUS"
