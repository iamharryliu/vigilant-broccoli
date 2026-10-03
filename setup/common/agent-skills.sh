#!/bin/bash

link_agent_file() {
    local target=$1
    local link_name=$2

    if [ "$target" -ef "$link_name" ]; then
        return 0
    fi
    if [ -e "$link_name" ] || [ -L "$link_name" ]; then
        printf 'Preserved conflicting agent entry: %s (expected %s)\n' "$link_name" "$target" >&2
        return 1
    fi

    ln -s "$target" "$link_name" || return 1
    printf 'Created symbolic link %s -> %s\n' "$link_name" "$target"
}

symlink_agent_skills() {
    local destination_home=${1:-$HOME}
    local skills_dir=$AGENT_SKILLS_DIR
    local commands_dir="$(dirname "$skills_dir")/.claude/commands"
    local skill_dir skill_name command_file destination
    local link_status=0

    if [ ! -d "$skills_dir" ]; then
        printf 'Agent skills directory does not exist: %s\n' "$skills_dir" >&2
        return 1
    fi

    for destination in "$destination_home/.claude/commands" "$destination_home/.claude/skills" "$destination_home/.agents/skills"; do
        mkdir -p "$destination" || return 1
    done

    for skill_dir in "$skills_dir"/*; do
        [ -f "$skill_dir/SKILL.md" ] || continue
        skill_name=${skill_dir##*/}
        link_agent_file "$skill_dir" "$destination_home/.claude/skills/$skill_name" || link_status=1
        link_agent_file "$skill_dir" "$destination_home/.agents/skills/$skill_name" || link_status=1
    done

    # PR runners may check out a branch from before shared skills existed.
    for command_file in "$commands_dir"/*.md; do
        [ -f "$command_file" ] || continue
        link_agent_file "$command_file" "$destination_home/.claude/commands/${command_file##*/}" || link_status=1
    done

    return "$link_status"
}

if [ -n "${BASH_VERSION:-}" ] && [ "${BASH_SOURCE[0]}" = "$0" ]; then
    AGENT_SKILLS_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../dotfiles/agent-skills" && pwd) || exit 1
    symlink_agent_skills "$@"
fi
