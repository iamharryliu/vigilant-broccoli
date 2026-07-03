# CLAUDE

## GitHub Actions Conventions

- Always use Node.js 24-compatible action versions to avoid deprecation warnings. Current pinned versions: `actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7`.
- The README status badges must reflect the workflows in `.github/workflows/` — update them when a workflow is added, renamed, or removed, and keep the badge list in alphabetical order by workflow name.
- Cron-triggered workflows (`cron-*.yml`) must also be dispatchable on demand — include `workflow_dispatch:` alongside their `schedule:` trigger.

## Root Scripts Conventions

- Useful infra-level CLI commands (SSH, logs, deploys, resets, service management) should be added as scripts in the root `package.json`.
- The cheatsheet (`scripts/shell/help.sh`, `npm run cheatsheet`) must reflect the root `package.json` scripts — update it when adding, renaming, or removing scripts.

## Git Conventions

- Never commit or push unless explicitly instructed to.

## Infrastructure Conventions

- Every deployed service — apps and self-hosted infrastructure alike (e.g. Gitea, code-server) — must have an Upptime status check: add its public URL to `sites` in the root `.upptimerc.yml`. Services without a public URL (e.g. `vb-manager-next` served locally via PM2, RabbitMQ reachable only inside the VM network) are exempt and covered by `cron-health-check` instead.

## Coding Conventions

- Prefer simple code implementation.
- Prefer functional programming patterns over OOP.
- Avoid excessive try/catch blocks; only add error handling when explicitly needed.
- Avoid comments and blocks, only if really necessary do inline comments.
- Avoid string literals, prefer having consts.
- Do not write tests unless explicitly asked.
- Do not write markdown reports, summaries, or documentation unless explicitly asked.
- Follow these guidelines unless explicitly told otherwise.

## NX Workspace Conventions

- For HTTP-related literals (methods, headers, status codes, common header names), prefer the shared consts in `libs/@vigilant-broccoli/common-js/src/lib/http/http.consts.ts` (`HTTP_METHOD`, `HTTP_HEADERS`, `HTTP_STATUS_CODES`, etc.) over defining local equivalents.
- For accessing environment variables server-side, prefer `getEnvironmentVariable` from `@vigilant-broccoli/common-node` over `process.env` directly. Exception: `NEXT_PUBLIC_` vars accessed client-side must use `process.env.NEXT_PUBLIC_*` direct property access — Next.js can only statically inline them at build time with direct access, not through a wrapper function.
- For anything touching fly.io services in `apps/api/*` (adding/modifying a service, smoke targets, fly configs, image delivery), read `projects/nx-workspace/docs/deployment/fly-service-pattern.md` first.
- UI applications must appear as a card under "UI Apps" in `projects/nx-workspace/pages-index/ui.html` (the GitHub Pages "UI" page).
- UI applications must implement i18n for all user-facing copy, with an English locale at minimum. Use the shared `createI18n` from `@vigilant-broccoli/react-lib` (`libs/@vigilant-broccoli/react-lib/src/i18n`) — do not hardcode copy in components or define a per-app i18n mechanism. Store copy as a per-locale JSON dictionary (e.g. `src/app/i18n/en.json`) keyed with SCREAMING_SNAKE dot-paths (e.g. `SHARING.OPEN_IN_GOOGLE_MAPS`); values are the display strings. Instantiate it in an app i18n module marked `'use client'` (it imports the `react-lib` barrel and provides React context/hooks), wrap the app in the returned `I18nProvider`, and read copy via `t('...')` from `useTranslation`. Styling strings (Tailwind classes, CSS values), icon glyphs, storage keys, and library config (e.g. Leaflet attribution) are not translatable copy and stay inline.

## Folder Structure

- [Notes](./notes/) - Collection of markdown notes linked with relative file paths.
- [Setup](./setup/) - Machine setup scripts and dotfiles.
  - [dotfiles](./setup/dotfiles/) - Shell configs, aliases, and scripts (symlinked to `$HOME`).
  - [mac](./setup/mac/) - macOS setup: `install.sh` entry point, dock, dock stacks, preferences, wallpaper.
  - [linux](./setup/linux/) - Linux setup: `install.sh` symlinks `~/vigilant-broccoli` to the repo location if cloned elsewhere, links shared dotfiles, and hooks `.rc.bash` into `~/.bashrc`. `-y` runs non-interactively (used by the code-server VM bootstrap, which clones the repo to `~/vigilant-broccoli`).
- [Projects](./projects/) - Software projects.
  - [nx-workspace](./projects/nx-workspace) - Nx workspace for Typescript projects
    - [vb-manager-next](./projects/nx-workspace/apps/ui/vb-manager-next) - Next.js management dashboard app (Tailwind, NextAuth, PM2 deployed)
    - [cloud8skate-sanity](./projects/nx-workspace/apps/cms/cloud8skate-sanity) - Sanity Studio CMS for cloud8skate (manual deploy only via `nx manual:deploy cloud8skate-sanity`)
    - [hearth](./projects/nx-workspace/apps/hearth) - Next.js shared-living app for homes/communes/communities (Supabase, Radix, deployed to Vercel). Deploys to Vercel at `vb-hearth.vercel.app` (project ID pinned in `project.json`) and the `home-management` R2 bucket — the bucket name predates the rename.
  - Note: `sharp` must remain in the workspace root `dependencies` (`projects/nx-workspace/package.json`) — required for Vercel serverless bundling of the `hearth` `/api/where-is` route.
