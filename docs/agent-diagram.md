# Agent Context Map

How `CLAUDE.md`, `docs/`, and Claude Code skills/commands relate for an agent working in this repo.

```mermaid
flowchart TD
    CLAUDE["CLAUDE.md<br/>(repo root)"]
    TODO["TODO.md<br/>(repo root)<br/>per-section priority tables"]

    subgraph DOCS["docs/"]
        DEV_TOOLING["DEV_TOOLING.md"]
        CI["CI.md"]
        APP_DEV["APP_DEVELOPMENT.md"]
        GIT["GIT.md"]
        NETWORK["infrastructure/network-management.md"]
        JELLYFIN_PI["infrastructure/jellyfin-pi.md"]
        NUANCE["nuance.md"]
        REPO_PATTERNS["repo-patterns.md"]
        REPO_OPS["repo-operations.md"]
        APP_README["app-readme-pattern.md"]
        UI_PATTERN["ui/ui-app-pattern.md"]
        FLY_PATTERN["api/deployment/fly-service-pattern.md"]
        SECRETS["infrastructure/secret-management.md"]
        REFACTOR["refactor-code-cleanup.md"]
        TODO_PATTERN["todo-pattern.md"]
        TIMELINE["learning-timeline.md"]
        AUDIT_TPL["audit/audit-template.md"]
        RND_TPL["rnd/rnd-template.md"]
    end

    CLAUDE --> DEV_TOOLING
    CLAUDE --> CI
    CLAUDE --> APP_DEV
    CLAUDE --> GIT
    CLAUDE --> NETWORK
    CLAUDE --> JELLYFIN_PI
    CLAUDE --> SECRETS
    CLAUDE --> NUANCE
    CLAUDE --> REFACTOR
    CLAUDE --> TODO
    CLAUDE --> TODO_PATTERN
    TODO_PATTERN --> TODO
    CLAUDE --> TIMELINE

    CI --> REPO_OPS
    CI --> SECRETS
    GIT --> CI
    APP_DEV --> REPO_PATTERNS
    APP_DEV --> APP_README
    APP_DEV --> UI_PATTERN
    APP_DEV --> FLY_PATTERN
    REPO_PATTERNS --> FLY_PATTERN
    REPO_PATTERNS --> REPO_OPS
    REPO_OPS --> JELLYFIN_PI
    JELLYFIN_PI --> NETWORK
    JELLYFIN_PI --> SECRETS

    subgraph SKILLS["setup/dotfiles/.claude"]
        subgraph COMMANDS["Commands"]
            CMD_TODO["create-todo-task.md"]
            CMD_SPELLCHECK["docs-spell-check.md"]
            CMD_REFACTOR_CLEANUP["refactor-code-cleanup.md"]
            CMD_RND_NOTE["rnd-note.md"]
            CMD_AUDIT_NOTE["audit-note.md"]
            CMD_SHIP_PR["ship-pr.md"]
            CMD_SYNC_MAIN["sync-main.md"]
            CMD_UPDATE_FEATURE_DOCS["update-feature-documentation.md"]
            CMD_UPDATE_READMES["update-readmes.md"]
        end
        SKILLDIR["skills/"]
    end

    COMMANDS -.->|symlinked to<br/>~/.claude/commands| CLAUDECODE["Claude Code<br/>skill list"]
    SKILLDIR -.->|symlinked to<br/>~/.claude/skills| CLAUDECODE

    CLAUDECODE -->|invoked as /update-readmes| APP_README
    CLAUDECODE -->|invoked as /create-todo-task| TODO_PATTERN
    CLAUDECODE -->|/create-todo-task<br/>writes a table row| TODO
    CLAUDECODE -->|invoked as /sync-main| GIT
    CLAUDECODE -->|/ship-pr syncs via /sync-main| GIT
    CLAUDECODE -->|invoked as /audit-note| AUDIT_TPL
    CLAUDECODE -->|invoked as /rnd-note| RND_TPL
    CLAUDECODE -.->|reads for conventions| CLAUDE
```

## How it fits together

- **`CLAUDE.md`** is the entry point every agent reads first. Its Doc Map links out to the docs under `docs/` that own each topic (dev tooling, CI, app development, git, networking, secrets, nuances, cleanup checklist, TODO format) — including this diagram itself. It also points at two living records that agents keep current as work lands: `TODO.md` and `docs/learning-timeline.md`.
- **This diagram is generated content, not source of truth** — `CLAUDE.md`'s Doc Map is authoritative. Whenever a Doc Map entry is added/removed, `docs/` gains or loses a doc, or skills/commands are rewired, update this file's mermaid graph and bullets to match in the same change.
- **Browse it rendered**: the GitHub Pages site's Claude Context page (`/#/claude-context` on `iamharryliu.github.io/vigilant-broccoli`, source `projects/nx-workspace/apps/ui/pages-index`) snapshots every file in this diagram at build time and renders the actual markdown link graph between them — file tree, search, and an Obsidian-style graph view. Which files it includes is configured in that app's `claude-context.snapshot.config.json`.
- **`docs/`** is a graph, not a flat list: top-level docs (e.g. `APP_DEVELOPMENT.md`) route to more specific pattern docs (`repo-patterns.md`, `ui-app-pattern.md`, `fly-service-pattern.md`), which in turn cite each other for narrower concerns (secrets, deploy destinations).
- **Skills** (Claude Code commands) live as markdown files in `setup/dotfiles/.claude/commands/` and `setup/dotfiles/.claude/skills/`, symlinked into `~/.claude/commands` and `~/.claude/skills` by `setup/common/symlinks.sh`. Each command file opens with `description:` frontmatter (one sentence, shown in the skill picker) and `argument-hint:` when it takes arguments; the body is the instruction. `skills/` currently holds only a `.gitkeep` — every entry today is a command. They are a separate discovery mechanism from the Doc Map — Claude Code surfaces them as `/slash-commands` — but their instructions explicitly point back into `CLAUDE.md` and `docs/` (e.g. `/create-todo-task` follows `docs/todo-pattern.md` — the single source for the `TODO.md` row format, also parsed by `infrastructure/agent-sandbox/solve-todo*.sh` — and writes a priority-ordered row into the relevant section table, `/update-readmes` follows `docs/app-readme-pattern.md`, `/audit-note` and `/rnd-note` treat their `docs/audit`/`docs/rnd` templates as the source of truth for note structure, `/sync-main` and `/ship-pr` implement the merge-don't-rebase sync policy documented in `GIT.md`).
