# CLAUDE

## Doc Map

- [Agent Context Map](./docs/agent-diagram.md) — mermaid diagram of how this Doc Map, `docs/`, and skills/commands relate; update it whenever an agent-related change lands (Doc Map entries added/removed, `docs/` structure changed, or skills/commands added/removed/rewired) — e.g. #167
- [Dev Tooling](./docs/DEV_TOOLING.md) — root `package.json` CLI scripts (SSH, logs, deploys, resets, service management) + cheatsheet; read first before adding or changing root scripts
- [CI](./docs/CI.md) — read first before touching workflows, monitoring, or IaC
  - GitHub Actions — action pinning, README badges, cron dispatch, workflow secrets
  - Upptime — status checks for deployed services
  - Terraform — IaC in `infrastructure/terraform/`
- [App Development](./docs/APP_DEVELOPMENT.md) — shared HTTP consts, env var access, auth, dependency pinning, npm publishing; read first before app work
  - [repo-patterns.md](./docs/repo-patterns.md) — decision map for adding/changing an app, workflow, or deploy: which existing pattern to copy
  - UI — [docs/ui/](./docs/ui/) (`ui-app-pattern.md`, `auth/*`, `deployment/*`)
  - API — [docs/api/](./docs/api/) (`deployment/fly-service-pattern.md`)
- [Git](./docs/GIT.md) — read first before committing or pushing
- [notes-pattern.md](./docs/notes-pattern.md) — read first before adding/editing files under `notes/`: universal link hygiene, plus per-topic conventions (e.g. cooking, lingo files) under `docs/notes/`
- [learning-timeline.md](./docs/learning-timeline.md) — month-by-month `Date (YYYY-MM) | Learned` table of what was being learned, software and otherwise; when work lands that introduces a topic the current month's row doesn't already cover, add or extend that row (one row per month, short and generic — "learned React", "improved sourdough baking by…", not implementation detail)
- [network-management.md](./docs/infrastructure/network-management.md) — read first before changing DNS records, domains/subdomains, proxying, tunnels, or VPN
- [secret-management.md](./docs/infrastructure/secret-management.md) — read first before adding a secret or a local `.env`/`.tfvars` file; secrets live in Vault/GCP Secret Manager (avoid local secret files), non-secret IDs are hardcoded in Terraform
- [nuance.md](./docs/nuance.md) — non-obvious bugs and quirks discovered in this repo; check before debugging something that looks like it shouldn't happen
- [refactor-code-cleanup.md](./docs/refactor-code-cleanup.md) — cleanup checklist for `/refactor-code-cleanup`; unattended `agentic:task:solve` runs must apply it before finishing
- [TODO.md](./TODO.md) — repo audit backlog as per-section (`## Security`/`## Performance`/`## Maintenance`/`## Feature Enhancements`/`## UI Cleanup`/`## Not so serious`) markdown tables (`ID | Priority | Description | Recommended Fix`, ordered P1→P3 then NA); read the `/create-todo-task` command before adding a row — its format is parsed by `infrastructure/agent-sandbox/solve-todo*.sh`, keep them in sync
- Coding Conventions — this file
- Folder Structure — this file

## Coding Conventions

- Prefer functional programming patterns over OOP.
- Avoid excessive try/catch blocks; only add error handling when explicitly needed.
- Avoid comments and blocks, only if really necessary do inline comments.
- Avoid string literals, prefer having consts.
- Do not write tests unless explicitly asked.
- Do not write markdown reports, summaries, or documentation unless explicitly asked.
- Keep responses brief and concise — one sentence per update, no unnecessary narration.
- If a PR touches files for a cloud service, or introduces/changes usage of one, add or update a `## Free Tier` section in that service's notes/docs file documenting its free tier limits (e.g. [github-actions.md](./notes/tech/software/web-dev/devops/automation/github-actions.md)).
- Before working on an app or directory, check its `README.md` for an `## Agent Context` section and follow any upkeep instructions it lists (e.g. keeping a Page Navigation section in sync with the routes).

## Folder Structure

- [Docs](./docs/) - Repo documentation.
- [Notes](./notes/) - Collection of markdown notes linked with relative file paths — see [notes-pattern.md](./docs/notes-pattern.md).
- [Setup](./setup/) - Machine setup scripts and dotfiles.
  - [dotfiles](./setup/dotfiles/) - Shell configs, aliases, and scripts (symlinked to `$HOME`).
  - [mac](./setup/mac/) - macOS setup.
  - [linux](./setup/linux/) - Linux setup.
- [Projects](./projects/) - Software projects.
  - [nx-workspace](./projects/nx-workspace) - Nx workspace for Typescript projects.
  - [grind-75](./projects/grind-75) - Standalone Grind 75 algorithm practice in Go/Python/TypeScript; the Python tests run as a `.pre-commit-config.yaml` hook.
