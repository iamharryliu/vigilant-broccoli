#!/bin/bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
source "$SCRIPT_DIR/agent-skills.sh"
FIXTURE_DIR=$(mktemp -d)
trap 'rm -rf "$FIXTURE_DIR"' EXIT

export AGENT_SKILLS_DIR="$FIXTURE_DIR/dotfiles/agent-skills"
COMMANDS_DIR="$FIXTURE_DIR/dotfiles/.claude/commands"
mkdir -p "$AGENT_SKILLS_DIR/example" "$COMMANDS_DIR"
printf '%s\n' '---' 'name: example' 'description: Compatibility fixture.' '---' 'Fixture instructions.' > "$AGENT_SKILLS_DIR/example/SKILL.md"
ln -s ../../agent-skills/example/SKILL.md "$COMMANDS_DIR/example.md"

FRESH_DIR="$FIXTURE_DIR/fresh"
symlink_agent_skills "$FRESH_DIR"
for directory in .claude/skills .agents/skills; do
    [ "$FRESH_DIR/$directory/example/SKILL.md" -ef "$AGENT_SKILLS_DIR/example/SKILL.md" ]
done
[ "$FRESH_DIR/.claude/commands/example.md" -ef "$COMMANDS_DIR/example.md" ]
[ -z "$(symlink_agent_skills "$FRESH_DIR")" ]

LEGACY_DIR="$FIXTURE_DIR/legacy"
CACHE_DIR="$FIXTURE_DIR/dotfiles/.claude/skills"
mkdir -p "$LEGACY_DIR/.claude" "$CACHE_DIR/synced" "$CACHE_DIR/.trash"
printf '%s\n' 'cached skill' > "$CACHE_DIR/synced/keep"
printf '%s\n' 'deleted skill' > "$CACHE_DIR/.trash/keep"
ln -s "$COMMANDS_DIR" "$LEGACY_DIR/.claude/commands"
ln -s "$CACHE_DIR" "$LEGACY_DIR/.claude/skills"
symlink_agent_skills "$LEGACY_DIR"
[ "$(cat "$CACHE_DIR/synced/keep")" = 'cached skill' ]
[ "$(cat "$CACHE_DIR/.trash/keep")" = 'deleted skill' ]
[ "$LEGACY_DIR/.claude/skills/example/SKILL.md" -ef "$AGENT_SKILLS_DIR/example/SKILL.md" ]

for kind in file directory symlink; do
    CONFLICT_DIR="$FIXTURE_DIR/conflict-$kind"
    mkdir -p "$CONFLICT_DIR/.agents/skills"
    case "$kind" in
        file) printf '%s\n' 'personal skill' > "$CONFLICT_DIR/.agents/skills/example" ;;
        directory) mkdir "$CONFLICT_DIR/.agents/skills/example" ;;
        symlink) ln -s missing-target "$CONFLICT_DIR/.agents/skills/example" ;;
    esac
    if symlink_agent_skills "$CONFLICT_DIR" > "$FIXTURE_DIR/conflict.log" 2>&1; then
        echo "Expected a conflict for $kind" >&2
        exit 1
    fi
    case "$kind" in
        file) [ "$(cat "$CONFLICT_DIR/.agents/skills/example")" = 'personal skill' ] ;;
        directory) [ -d "$CONFLICT_DIR/.agents/skills/example" ] && [ ! -L "$CONFLICT_DIR/.agents/skills/example" ] ;;
        symlink) [ "$(readlink "$CONFLICT_DIR/.agents/skills/example")" = missing-target ] ;;
    esac
done

# Emulate an older PR: the command is a regular file and the new skills tree disappears.
rm "$COMMANDS_DIR/example.md"
printf '%s\n' 'Legacy command instructions.' > "$COMMANDS_DIR/example.md"
mv "$AGENT_SKILLS_DIR" "$FIXTURE_DIR/newer-branch-skills"
[ "$(cat "$FRESH_DIR/.claude/commands/example.md")" = 'Legacy command instructions.' ]
[ "$(cat "$LEGACY_DIR/.claude/commands/example.md")" = 'Legacy command instructions.' ]

echo 'Agent setup smoke checks passed: fresh, repeat, legacy cache, conflicts, and older PR commands.'
