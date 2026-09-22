# CLAUDE

## Doc Map

- [Agent Context Map](./docs/agent-diagram.md) — how this Doc Map, `docs/`, and skills/commands relate; update it in the same change whenever any of those change
- [Dev Tooling](./docs/DEV_TOOLING.md) — root `package.json` CLI scripts and cheatsheet; read first before adding or changing root scripts
- [CI](./docs/CI.md) — read first before touching workflows, monitoring, or IaC
  - GitHub Actions — action pinning, README badges, cron dispatch, workflow secrets
  - Upptime — status checks for deployed services
  - Terraform — IaC in `infrastructure/terraform/`
- [App Development](./docs/APP_DEVELOPMENT.md) — shared consts, env vars, auth, dependency pinning, npm publishing; read first before app work
  - [repo-patterns.md](./docs/repo-patterns.md) — decision map for adding/changing an app, workflow, or deploy: which existing pattern to copy
  - UI — [docs/ui/](./docs/ui/) (`ui-app-pattern.md`, `auth/*`, `deployment/*`)
  - API — [docs/api/](./docs/api/) (`deployment/fly-service-pattern.md`)
- [Git](./docs/GIT.md) — read first before committing or pushing
  - Concurrent Claude Sessions — `ListAgents` before branching, staging, committing, or stashing; the index, `HEAD`, and the stash are shared across sessions on one worktree
- [notes-pattern.md](./docs/notes-pattern.md) — read first before adding or editing files under `notes/`; per-topic conventions live under `docs/notes/`
- [learning-timeline.md](./docs/learning-timeline.md) — month-by-month record of what was being learned; extend the current month's row when work lands that introduces a new topic
- [network-management.md](./docs/infrastructure/network-management.md) — read first before changing DNS, domains, proxying, tunnels, or VPN
- [jellyfin-pi.md](./docs/infrastructure/jellyfin-pi.md) — the Ansible-provisioned homelab Pi running Jellyfin; read first before provisioning or changing hardware on the LAN (there is no Terraform for it)
- [secret-management.md](./docs/infrastructure/secret-management.md) — read first before adding a secret or a local `.env`/`.tfvars` file
- [nuance.md](./docs/nuance.md) — non-obvious bugs and quirks in this repo; check before debugging something that looks impossible
- [refactor-code-cleanup.md](./docs/refactor-code-cleanup.md) — cleanup checklist behind `/refactor-code-cleanup` and unattended `agentic:task:solve` runs
- [TODO.md](./TODO.md) — repo audit backlog
- [todo-pattern.md](./docs/todo-pattern.md) — read first before adding or editing a `TODO.md` row; single source for its format and the id contract the sandbox scripts parse
- Coding Conventions — this file
- Folder Structure — this file

## Coding Conventions

- Prefer functional programming patterns over OOP.
- Avoid excessive try/catch blocks; only add error handling when explicitly needed.
- Avoid string literals, prefer having consts.
- Do not write tests unless explicitly asked.
- Comments have to earn their place. Write one only when it says something the code cannot: why a non-obvious approach was chosen, an external constraint or API quirk, a gotcha, or a worked example. Never add one that restates the next line (`// Get the last part after slash`), labels a block with its own code's words (`// Helper function to ...`, `// Start a single container`), or explains a self-describing config flag (`agentRules: false`) — that rationale goes in the commit message or the relevant `docs/` page, not the file. Two exceptions: keep a comment that is the sole body of an otherwise-empty block (an intentional empty `catch`), and leave `TODO`/`FIXME`/lint-directive comments alone. Generator scaffolding (`// Add more Next.js plugins to this list if needed.`) is noise — delete it when you touch the file.
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
