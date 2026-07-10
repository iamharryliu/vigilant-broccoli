# CLAUDE

## GitHub Actions Conventions

- Always use Node.js 24-compatible action versions to avoid deprecation warnings (GitHub is deprecating the Node 20 runtime — a Node 20 action still runs but logs a warning on every job). Before pinning or bumping any action, verify its `action.yml` declares `runs.using: 'node24'` at the target SHA (`gh api "repos/OWNER/REPO/contents/action.yml?ref=SHA" --jq '.content' | base64 -d | grep using`); pin to the full commit SHA with a trailing `# vN` version comment. Current pinned versions: `actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7`, `google-github-actions/auth@7c6bc770dae815cd3e89ee6cdf493a5fab2cc093 # v3`, `google-github-actions/setup-gcloud@aa5489c8933f4cc7a4f7d45035b3b1440c9c10db # v3`, `google-github-actions/get-secretmanager-secrets@bc9c54b29fdffb8a47776820a7d26e77b379d262 # v3`. When one of these actions appears in more than one workflow (or in `.github/actions/*`), bump every occurrence together so pins stay uniform.
- The README status badges must reflect the workflows in `.github/workflows/` — update them when a workflow is added, renamed, or removed, and keep the badge list in alphabetical order by workflow name.
- Cron-triggered workflows (`cron-*.yml`) must also be dispatchable on demand — include `workflow_dispatch:` alongside their `schedule:` trigger.
- Keep GitHub Actions secrets slim — only add secrets that are actively used in workflows. Remove unused secrets to reduce exposure and maintenance burden.
- Never introduce a new GitHub Actions repo secret. The only secrets that may ever exist are `GCP_SERVICE_ACCOUNT` and `GCP_WORKLOAD_IDENTITY_PROVIDER` (used for Workload Identity Federation to GCP). Any other credential a workflow needs must come from GCP Secret Manager via `google-github-actions/get-secretmanager-secrets`, not a new repo secret — workflows may optionally read a repo secret as a fallback (e.g. `secrets.GH_PAT || secrets.GITHUB_TOKEN`) as long as the workflow still functions correctly when that secret is unset.

## Root Scripts Conventions

- Useful infra-level CLI commands (SSH, logs, deploys, resets, service management) should be added as scripts in the root `package.json`.
- The cheatsheet (`docs/cheatsheet.md`, linked from the README, printed via `scripts/shell/cheatsheet.sh` / `pnpm run cheatsheet`) must reflect the root `package.json` scripts — update it when adding, renaming, or removing scripts. `docs/cheatsheet.md` is the source of truth; `cheatsheet.sh` only prints its fenced code block and must not be edited to add content directly.

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
- Every fly.io service in `apps/api/*` exposes Swagger docs at `/docs` via `createDocsPlugin` from `@vigilant-broccoli/fastify`, with its OpenAPI spec built by `createSwaggerSpec` in the service's `src/libs/swagger.ts` (`src/swagger.ts` in the email services). When adding, removing, or changing a service's routes (paths, methods, request/response shapes, auth), update that swagger spec in the same change.
- For frontend React applications, prefer existing shared components from `@vigilant-broccoli/react-lib` (`libs/@vigilant-broccoli/react-lib/src/components`) over hand-rolling equivalents (e.g. `CRUDItemList` for CRUD list management, `CardContainer`, `Button`, `IconButton`), unless told otherwise. Check the lib's component barrel before building new UI.
- UI applications must appear as a card under "UI Apps" in `projects/nx-workspace/apps/ui/pages-index/src/app/pages/UiPage.tsx` (the GitHub Pages "UI" page).
- UI applications must implement i18n for all user-facing copy, with an English locale at minimum. Use the shared `createI18n` from `@vigilant-broccoli/react-lib` (`libs/@vigilant-broccoli/react-lib/src/i18n`) — do not hardcode copy in components or define a per-app i18n mechanism. Store copy as a per-locale JSON dictionary (e.g. `src/app/i18n/en.json`) keyed with SCREAMING_SNAKE dot-paths (e.g. `SHARING.OPEN_IN_GOOGLE_MAPS`); values are the display strings. Instantiate it in an app i18n module marked `'use client'` (it imports the `react-lib` barrel and provides React context/hooks), wrap the app in the returned `I18nProvider`, and read copy via `t('...')` from `useTranslation`. Styling strings (Tailwind classes, CSS values), icon glyphs, storage keys, and library config (e.g. Leaflet attribution) are not translatable copy and stay inline.
- Never declare a dependency as `"*"` (or an exact/stale pin that differs from root) in a lib/app `package.json` for a package already pinned in the workspace root `package.json` — pnpm only re-resolves an importer when its own specifier changes, so a `"*"` copy can silently drift to a different version than root once root is bumped, causing a confusing type error instead of an obvious version-mismatch one (e.g. two `fastify` versions producing incompatible `FastifyInstance` types → `TS2345`). Mirror the root's caret range instead; compatible caret ranges let pnpm dedupe to one resolved version, which is what actually prevents the drift. Do NOT use `overrides` in `pnpm-workspace.yaml` to force versions for packages consumed by the pruned fly-services in `apps/api/*`: `@nx/js:prune-lockfile` copies the `overrides:` block into each pruned `pnpm-lock.yaml`, but the pruned `pnpm install --frozen-lockfile --prod` (in `scripts/shell/smoke-dist.sh` and the service Dockerfiles) has no matching overrides config, so it fails with `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH` — breaking smoke and the real fly deploy. Specifier alignment is the guardrail; overrides are not.
- A `libs/@vigilant-broccoli/*` lib publishes to npm iff its `project.json` defines a `publish-package` target — `publishConfig` in `package.json` alone does nothing; `deploy-npm-packages` in `deploy.yml` gates on `nx show projects --withTarget=publish-package`. To add publishing to a lib, copy the pattern from `react-lib` or `slack-workspace`: `package.json` gets `publishConfig: { "access": "public" }` + a `repository` block; `project.json` gets a `release.version` block (`currentVersionResolver: "git-tag"`), a `publish-package` target (`nx:run-commands`, runs `scripts/resolve-workspace-deps.js` to resolve `workspace:*` deps to real versions, then `npm publish --access public --provenance`, skipping if that version is already published), and an `nx-release-publish` target. CI auth comes from the `NPM_TOKEN` Vault secret (exported as `NODE_AUTH_TOKEN` in the `deploy-npm-packages` job) — must be an Automation or Granular Access Token, never a Classic token, since Classic tokens can trigger interactive OTP prompts that fail non-interactively in CI. A brand-new package's first publish cannot go through npm trusted publishing (OIDC) — npm requires the package to already exist on the registry before a trusted publisher can be attached, so the very first version of any new lib must be published with this token-based flow regardless.

## Folder Structure

- [Docs](./docs/) - Repo documentation. See [repo-patterns.md](./docs/repo-patterns.md) for the development/test/CI/deployment patterns map before adding or changing apps, workflows, or deploys, [repo-operations.md](./docs/repo-operations.md) for infra operations, secrets, data/persistence, local dev, and auth, and [cheatsheet.md](./docs/cheatsheet.md) for infra-level CLI commands (also linked from the README).
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
