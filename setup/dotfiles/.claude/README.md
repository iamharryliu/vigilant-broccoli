# setup/dotfiles/.claude

Claude Code skills (slash commands) for this repo, kept in the dotfiles tree so they're versioned like everything else under `setup/dotfiles/`.

## Table of Contents

- [Layout](#layout)
- [How they relate to CLAUDE.md and docs/](#how-they-relate-to-claudemd-and-docs)

## Layout

- `commands/` — one markdown file per slash command. `setup/common/symlinks.sh` symlinks this directory to `~/.claude/commands`, and `skills/` to `~/.claude/skills`, so editing a file here changes the live command everywhere it's used. Each file opens with frontmatter: `description:` (one sentence, shown in the skill picker) and `argument-hint:` when the command takes arguments; the body is the instruction Claude Code follows when the command runs.
- `skills/` — currently holds only a `.gitkeep`; every entry today is a command, not a skill.

## How they relate to `CLAUDE.md` and `docs/`

Commands are a separate discovery mechanism from `CLAUDE.md`'s Doc Map — Claude Code surfaces them as `/slash-commands` — but their instructions explicitly point back into `CLAUDE.md` and `docs/` rather than duplicating conventions: `/create-todo-task` follows [todo-pattern.md](../../../docs/todo-pattern.md) and writes a priority-ordered row into `TODO.md`; `/update-readmes` follows [app-readme-pattern.md](../../../docs/app-readme-pattern.md); `/audit-note` and `/rnd-note` treat their `docs/audit`/`docs/rnd` templates as the source of truth for note structure; `/sync-main` and `/ship-pr` implement the merge-don't-rebase sync policy documented in `CLAUDE.md`'s Git section; `/refactor-code-cleanup` and `/ship-pr`'s pre-staging diff review apply [refactor-code-cleanup.md](../../../docs/refactor-code-cleanup.md), which in turn defers to `CLAUDE.md`'s comment rule.

When a command's behavior and the doc it follows disagree, change the doc first, then the command — the same rule `CLAUDE.md`'s Git section states for its own conventions.
