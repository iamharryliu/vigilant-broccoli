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
- [network-management.md](./docs/infrastructure/network-management.md) — read first before changing DNS records, domains/subdomains, proxying, tunnels, or VPN
- [nuance.md](./docs/nuance.md) — non-obvious bugs and quirks discovered in this repo; check before debugging something that looks like it shouldn't happen
- [refactor-code-cleanup.md](./docs/refactor-code-cleanup.md) — cleanup checklist for `/refactor-code-cleanup`; unattended `agentic:task:solve` runs must apply it before finishing
- Coding Conventions — this file
- Folder Structure — this file

## Coding Conventions

- Prefer functional programming patterns over OOP.
- Avoid excessive try/catch blocks; only add error handling when explicitly needed.
- Avoid comments and blocks, only if really necessary do inline comments.
- Avoid string literals, prefer having consts.
- Do not write tests unless explicitly asked.
- Do not write markdown reports, summaries, or documentation unless explicitly asked.

## Folder Structure

- [Docs](./docs/) - Repo documentation.
- [Notes](./notes/) - Collection of markdown notes linked with relative file paths.
- [Setup](./setup/) - Machine setup scripts and dotfiles.
  - [dotfiles](./setup/dotfiles/) - Shell configs, aliases, and scripts (symlinked to `$HOME`).
  - [mac](./setup/mac/) - macOS setup.
  - [linux](./setup/linux/) - Linux setup.
- [Projects](./projects/) - Software projects.
  - [nx-workspace](./projects/nx-workspace) - Nx workspace for Typescript projects.
