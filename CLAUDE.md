# CLAUDE

## GitHub Actions Conventions

- Always use Node.js 24-compatible action versions to avoid deprecation warnings (GitHub is deprecating the Node 20 runtime — a Node 20 action still runs but logs a warning on every job). Before pinning or bumping any action, verify its `action.yml` declares `runs.using: 'node24'` at the target SHA (`gh api "repos/OWNER/REPO/contents/action.yml?ref=SHA" --jq '.content' | base64 -d | grep using`); pin to the full commit SHA with a trailing `# vN` version comment. When adding an action already used elsewhere, copy its SHA from an existing workflow — the workflows are the source of truth for current pins. When bumping an action that appears in more than one workflow (or in `.github/actions/*`), bump every occurrence together so pins stay uniform.
- The README status badges must reflect the workflows in `.github/workflows/` — update them when a workflow is added, renamed, or removed, and keep the badge list in alphabetical order by workflow name.
- Cron-triggered workflows (`cron-*.yml`) must also be dispatchable on demand — include `workflow_dispatch:` alongside their `schedule:` trigger.
- Never introduce a new GitHub Actions repo secret, and remove unused ones. The only required repo secrets are `GCP_SERVICE_ACCOUNT` and `GCP_WORKLOAD_IDENTITY_PROVIDER` (used for Workload Identity Federation to GCP). Any other credential a workflow needs must come from GCP Secret Manager via `google-github-actions/get-secretmanager-secrets`, not a new repo secret — workflows may optionally read a repo secret as a fallback (e.g. `secrets.GH_PAT || secrets.GITHUB_TOKEN`) as long as the workflow still functions correctly when that secret is unset. The secret inventory lives in [secret-management.md](./docs/infrastructure/secret-management.md).

## Root Scripts Conventions

- Useful infra-level CLI commands (SSH, logs, deploys, resets, service management) should be added as scripts in the root `package.json`.
- The cheatsheet (`docs/cheatsheet.md`, linked from the README, printed via `scripts/shell/cheatsheet.sh` / `pnpm run cheatsheet`) must reflect the root `package.json` scripts — update it when adding, renaming, or removing scripts. `docs/cheatsheet.md` is the source of truth; `cheatsheet.sh` only prints its fenced code block and must not be edited to add content directly.

## Git Conventions

- Never commit or push unless explicitly instructed to.

## Infrastructure Conventions

- Every deployed service — apps and self-hosted infrastructure alike (e.g. Gitea, code-server) — must have an Upptime status check: add its public URL to `sites` in the root `.upptimerc.yml`. Services without a public URL (e.g. `vb-manager-next` served locally via PM2, RabbitMQ reachable only inside the VM network) are exempt and covered by `ci-health-check` instead.
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

## NX Workspace Conventions

- For HTTP-related literals (methods, headers, status codes, common header names), prefer the shared consts in `libs/@vigilant-broccoli/common-js/src/lib/http/http.consts.ts` (`HTTP_METHOD`, `HTTP_HEADERS`, `HTTP_STATUS_CODES`, etc.) over defining local equivalents.
- For accessing environment variables server-side, prefer `getEnvironmentVariable` from `@vigilant-broccoli/common-node` over `process.env` directly. Exception: `NEXT_PUBLIC_` vars accessed client-side must use `process.env.NEXT_PUBLIC_*` direct property access — Next.js can only statically inline them at build time with direct access, not through a wrapper function.
- For anything touching fly.io services in `apps/api/*` (adding/modifying a service, smoke targets, fly configs, image delivery), read `projects/nx-workspace/docs/deployment/fly-service-pattern.md` first.
- For user-facing auth (adding sign-in to an app, protecting API routes, Google-token access), read `projects/nx-workspace/docs/auth/supabase-auth-pattern.md` first — use `createSupabaseAuth` from `@vigilant-broccoli/react-lib`, not a hand-rolled or per-app auth mechanism, and register new callback URLs in `infrastructure/terraform/supabase-auth.tf`.
- For UI applications, read `projects/nx-workspace/docs/ui/ui-app-pattern.md` first — it owns the binding UI requirements (prefer `@vigilant-broccoli/react-lib` shared components over hand-rolling, i18n via the shared `createI18n` for all user-facing copy, a card on the pages-index "UI Apps" page) and their mechanics. Each UI deploy destination has a pattern doc in `projects/nx-workspace/docs/deployment/` (`vercel-deploy-pattern.md`, `cloudflare-pages-deploy-pattern.md`, `github-pages-deploy-pattern.md`).
- Every fly.io service in `apps/api/*` exposes Swagger docs at `/docs` via `createDocsPlugin` from `@vigilant-broccoli/fastify`, with its OpenAPI spec built by `createSwaggerSpec` in the service's `src/libs/swagger.ts` (`src/swagger.ts` in the email services). When adding, removing, or changing a service's routes (paths, methods, request/response shapes, auth), update that swagger spec in the same change.
- Never declare a dependency as `"*"` (or an exact/stale pin that differs from root) in a lib/app `package.json` for a package already pinned in the workspace root `package.json` — mirror the root's caret range instead. pnpm only re-resolves an importer when its own specifier changes, so a `"*"` copy can silently drift to a different resolved version once root is bumped, surfacing as a confusing type error (e.g. two `fastify` versions producing incompatible `FastifyInstance` types) instead of an obvious version mismatch; matching caret ranges let pnpm dedupe to one resolved version. Do NOT use `overrides` in `pnpm-workspace.yaml` to force versions for packages consumed by the fly services — it breaks their pruned installs (see [fly-service-pattern.md](./projects/nx-workspace/docs/deployment/fly-service-pattern.md)).
- A `libs/@vigilant-broccoli/*` lib publishes to npm iff its `project.json` defines a `publish-package` target — `publishConfig` in `package.json` alone does nothing. Before adding or changing npm publishing, follow the npm package publishing steps in [repo-patterns.md](./docs/repo-patterns.md) (reference libs, target wiring, `NPM_TOKEN` requirements, first-publish constraints).

## Folder Structure

- [Docs](./docs/) - Repo documentation. See [repo-patterns.md](./docs/repo-patterns.md) for the development/test/CI/deployment patterns map before adding or changing apps, workflows, or deploys, [repo-operations.md](./docs/repo-operations.md) for infra operations, secrets, data/persistence, local dev, and auth, [network-management.md](./docs/infrastructure/network-management.md) for public URLs/DNS by domain/provider, and [cheatsheet.md](./docs/cheatsheet.md) for infra-level CLI commands (also linked from the README).
- [Notes](./notes/) - Collection of markdown notes linked with relative file paths.
- [Setup](./setup/) - Machine setup scripts and dotfiles.
  - [dotfiles](./setup/dotfiles/) - Shell configs, aliases, and scripts (symlinked to `$HOME`).
  - [mac](./setup/mac/) - macOS setup: `install.sh` entry point, dock, dock stacks, preferences, wallpaper.
  - [linux](./setup/linux/) - Linux setup: `install.sh` symlinks `~/vigilant-broccoli` to the repo location if cloned elsewhere, links shared dotfiles, and hooks `.rc.bash` into `~/.bashrc`. `-y` runs non-interactively (used by the code-server VM bootstrap, which clones the repo to `~/vigilant-broccoli`).
- [Projects](./projects/) - Software projects.
  - [nx-workspace](./projects/nx-workspace) - Nx workspace for Typescript projects. See [repo-patterns.md](./docs/repo-patterns.md) for per-app deploy patterns and [repo-operations.md](./docs/repo-operations.md) for infra quirks (e.g. R2 bucket naming).
  - Note: `sharp` must remain in the workspace root `dependencies` (`projects/nx-workspace/package.json`) — required for Vercel serverless bundling of the `hearth` `/api/where-is` route.
