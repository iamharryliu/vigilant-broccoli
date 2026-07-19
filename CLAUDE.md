# CLAUDE

## Doc Map

- [Dev Tooling](./DEV_TOOLING.md) — root `package.json` CLI scripts (SSH, logs, deploys, resets, service management) + cheatsheet; read first before adding or changing root scripts
- [CI](./CI.md) — read first before touching workflows, monitoring, or IaC
  - GitHub Actions — action pinning, README badges, cron dispatch, workflow secrets
  - Upptime — status checks for deployed services
  - Terraform — IaC in `infrastructure/terraform/`
- [App Development](./APP_DEVELOPMENT.md) — shared HTTP consts, env var access, auth, dependency pinning, npm publishing; read first before app work
  - [repo-patterns.md](./docs/repo-patterns.md) — decision map for adding/changing an app, workflow, or deploy: which existing pattern to copy
  - UI — [projects/nx-workspace/docs/ui/](./projects/nx-workspace/docs/ui/) (`ui-app-pattern.md`, `deployment/*`)
  - API — [projects/nx-workspace/docs/api/](./projects/nx-workspace/docs/api/) (`deployment/fly-service-pattern.md`)
- Git Conventions — this file
- Infrastructure Conventions — this file
- Coding Conventions — this file
- Folder Structure — this file

## Git Conventions

- Never commit or push unless explicitly instructed to.

## Infrastructure Conventions

- Changes to network infrastructure (DNS records, domains/subdomains, proxying, tunnels, VPN) must be reflected in [network-management.md](./docs/infrastructure/network-management.md).

## Coding Conventions

- Prefer simple code implementation.
- Prefer functional programming patterns over OOP.
- Avoid excessive try/catch blocks; only add error handling when explicitly needed.
- Avoid comments and blocks, only if really necessary do inline comments.
- Avoid string literals, prefer having consts.
- Do not write tests unless explicitly asked.
- Do not write markdown reports, summaries, or documentation unless explicitly asked.
- Follow these guidelines unless explicitly told otherwise.

## Folder Structure

Root convention docs (`APP_DEVELOPMENT.md`, `CI.md`, `DEV_TOOLING.md`) are covered by the Doc Map above.

- [Docs](./docs/) - Repo documentation. See [repo-patterns.md](./docs/repo-patterns.md) for the development/test/CI/deployment patterns map before adding or changing apps, workflows, or deploys, [repo-operations.md](./docs/repo-operations.md) for infra operations, secrets, data/persistence, local dev, and auth, [network-management.md](./docs/infrastructure/network-management.md) for public URLs/DNS by domain/provider, and [cheatsheet.md](./docs/cheatsheet.md) for infra-level CLI commands (also linked from the README).
- [Notes](./notes/) - Collection of markdown notes linked with relative file paths.
- [Setup](./setup/) - Machine setup scripts and dotfiles.
  - [dotfiles](./setup/dotfiles/) - Shell configs, aliases, and scripts (symlinked to `$HOME`).
  - [mac](./setup/mac/) - macOS setup: `install.sh` entry point, dock, dock stacks, preferences, wallpaper.
  - [linux](./setup/linux/) - Linux setup: `install.sh` symlinks `~/vigilant-broccoli` to the repo location if cloned elsewhere, links shared dotfiles, and hooks `.rc.bash` into `~/.bashrc`. `-y` runs non-interactively (used by the code-server VM bootstrap, which clones the repo to `~/vigilant-broccoli`).
- [Projects](./projects/) - Software projects.
  - [nx-workspace](./projects/nx-workspace) - Nx workspace for Typescript projects. See [repo-patterns.md](./docs/repo-patterns.md) for per-app deploy patterns and [repo-operations.md](./docs/repo-operations.md) for infra quirks (e.g. R2 bucket naming).
  - Note: `sharp` must remain in the workspace root `dependencies` (`projects/nx-workspace/package.json`) — required for Vercel serverless bundling of the `hearth` `/api/where-is` route.
