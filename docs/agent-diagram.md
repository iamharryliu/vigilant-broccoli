# Agent Context Map

How `CLAUDE.md`, `docs/`, and Claude Code skills/commands relate for an agent working in this repo.

```mermaid
flowchart TD
    CLAUDE["CLAUDE.md<br/>(repo root)"]

    subgraph DOCS["docs/"]
        DEV_TOOLING["DEV_TOOLING.md"]
        CI["CI.md"]
        APP_DEV["APP_DEVELOPMENT.md"]
        GIT["GIT.md"]
        NETWORK["infrastructure/network-management.md"]
        NUANCE["nuance.md"]
        REPO_PATTERNS["repo-patterns.md"]
        REPO_OPS["repo-operations.md"]
        APP_README["app-readme-pattern.md"]
        UI_PATTERN["ui/ui-app-pattern.md"]
        FLY_PATTERN["api/deployment/fly-service-pattern.md"]
        SECRETS["infrastructure/secret-management.md"]
        REFACTOR["refactor-code-cleanup.md"]
    end

    CLAUDE --> DEV_TOOLING
    CLAUDE --> CI
    CLAUDE --> APP_DEV
    CLAUDE --> GIT
    CLAUDE --> NETWORK
    CLAUDE --> SECRETS
    CLAUDE --> NUANCE
    CLAUDE --> REFACTOR

    CI --> REPO_OPS
    CI --> SECRETS
    GIT --> CI
    APP_DEV --> REPO_PATTERNS
    APP_DEV --> APP_README
    APP_DEV --> UI_PATTERN
    APP_DEV --> FLY_PATTERN
    REPO_PATTERNS --> FLY_PATTERN
    REPO_PATTERNS --> REPO_OPS

    subgraph SKILLS["setup/dotfiles/.claude"]
        subgraph COMMANDS["Commands"]
            CMD_TODO["create-todo-task.md"]
            CMD_SPELLCHECK["docs-spell-check.md"]
            CMD_REFACTOR_CLEANUP["refactor-code-cleanup.md"]
            CMD_ALTERNATIVES["rnd-suggest-alternatives.md"]
            CMD_SHIP_PR["ship-pr.md"]
            CMD_UPDATE_FEATURE_DOCS["update-feature-documentation.md"]
            CMD_UPDATE_READMES["update-readmes.md"]
        end
        SKILLDIR["skills/"]
    end

    COMMANDS -.->|symlinked to<br/>~/.claude/commands| CLAUDECODE["Claude Code<br/>skill list"]
    SKILLDIR -.->|symlinked to<br/>~/.claude/skills| CLAUDECODE

    CLAUDECODE -->|invoked as /update-readmes| APP_README
    CLAUDECODE -->|invoked as /create-todo-task| CLAUDE
    CLAUDECODE -.->|reads for conventions| CLAUDE
```

## How it fits together

- **`CLAUDE.md`** is the entry point every agent reads first. Its Doc Map links out to the docs under `docs/` that own each topic (dev tooling, CI, app development, git, networking, secrets, nuances, cleanup checklist) — including this diagram itself.
- **This diagram is generated content, not source of truth** — `CLAUDE.md`'s Doc Map is authoritative. Whenever a Doc Map entry is added/removed, `docs/` gains or loses a doc, or skills/commands are rewired, update this file's mermaid graph and bullets to match in the same change.
- **`docs/`** is a graph, not a flat list: top-level docs (e.g. `APP_DEVELOPMENT.md`) route to more specific pattern docs (`repo-patterns.md`, `ui-app-pattern.md`, `fly-service-pattern.md`), which in turn cite each other for narrower concerns (secrets, deploy destinations).
- **Skills** (Claude Code commands) live as markdown files in `setup/dotfiles/.claude/commands/` and `setup/dotfiles/.claude/skills/`, symlinked into `~/.claude/commands` and `~/.claude/skills` by `setup/common/symlinks.sh`. They are a separate discovery mechanism from the Doc Map — Claude Code surfaces them as `/slash-commands` — but their instructions explicitly point back into `CLAUDE.md` and `docs/` (e.g. `/create-todo-task` reads `CLAUDE.md` for constraints, `/update-readmes` follows `docs/app-readme-pattern.md`).
