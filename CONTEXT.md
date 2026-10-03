# Agent Context

Shared repository guidance. Edit `CONTEXT.md`; `AGENTS.md` and `CLAUDE.md` are committed relative symlinks to it. See [agent support](./docs/agent-support.md) for the adapter layout and skill installation.

## Table of Contents

- [Doc Map](#doc-map)
- [Dev Tooling](#dev-tooling)
  - [Root Scripts Conventions](#root-scripts-conventions)
  - [Toolchain](#toolchain)
- [CI](#ci)
- [App Development](#app-development)
  - [UI](#ui)
  - [API](#api)
  - [Documentation](#documentation)
- [Git](#git)
- [Coding Conventions](#coding-conventions)
- [Folder Structure](#folder-structure)

## Doc Map

Every doc listed here — and this file — carries a `## Table of Contents` immediately after its one-line purpose, listing each `##` section as a link in document order (nest `###` entries under their parent, as this file's own does). It exists because these are agent context files read by fetching a slice, not by scrolling: the ToC is what makes "which section do I need" answerable from the first screen, and it doubles as an anchor-integrity check when a heading is renamed. It is fully derived — rebuild it from scratch whenever sections are added, removed, renamed, or reordered rather than patching it, and add one to any doc here that is still missing it the next time you touch that doc. Two exemptions: a doc with fewer than three `##` sections (a ToC that short only repeats what is already visible — e.g. [refactor-code-cleanup.md](./docs/refactor-code-cleanup.md)), and headings inside fenced code blocks, which are examples and never ToC entries. Per-file README ToCs follow [app-readme-pattern.md](./docs/app-readme-pattern.md) instead.

Browse this whole graph rendered, with full-text search and a link graph view, at the GitHub Pages Agent Context page (`/#/claude-context` on `iamharryliu.github.io/vigilant-broccoli`, source `projects/nx-workspace/apps/ui/pages-index`) — it snapshots `CONTEXT.md`, every `docs/` file, and shared `setup/dotfiles/agent-skills/` at build time, per `claude-context.snapshot.config.json`.

| Doc                                                                              | Description                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Dev Tooling](#dev-tooling)                                                      | This file — root `package.json` CLI scripts and the cheatsheets; read first before adding or changing a root script                                                                                                                  |
| [CI](#ci)                                                                        | This file — the standing rule that no new GitHub Actions repo secret may be introduced                                                                                                                                               |
| [workflow-conventions.md](./docs/ci/workflow-conventions.md)                     | Workflow naming and routing, action/runner pinning, timeouts, concurrency, cron staggering, toolchain versions, required coverage and the agentic solve pipeline; read first before adding or changing a workflow                    |
| [database-migrations.md](./docs/ci/database-migrations.md)                       | How `migrate.ts` applies the shared Supabase migrations on deploy and on `nx serve`; read first before adding a migration                                                                                                            |
| [terraform.md](./docs/ci/terraform.md)                                           | Where IaC lives, that applies stay local, and how `cron-terraform-drift` detects divergence; read first before changing infrastructure                                                                                               |
| [App Development](#app-development)                                              | This file — shared consts, env vars, dependency pinning, npm publishing; read first before app work                                                                                                                                  |
| [Git](#git)                                                                      | This file — the standing no-unprompted-commits rule and the shared-worktree safety rules, which bind every session                                                                                                                   |
| [git-workflow.md](./docs/git-workflow.md)                                        | Branching, staging, commit and PR conventions, concurrent-session coordination, and staying current with `main`; read first before committing or pushing                                                                             |
| [github-repo-protection.md](./docs/infrastructure/github-repo-protection.md)     | How `main`'s Terraform-managed ruleset and its bypass actors work; read first before changing protection or debugging a `GH006` push rejection                                                                                       |
| [docs/agent-support.md](./docs/agent-support.md)                                 | How shared skills and Claude command aliases are installed for Claude Code and Codex, and relate to this Doc Map                                                                                                                     |
| [app-development.md](./docs/app-development/app-development.md)                  | Decision map for adding an app, lib, or deploy destination: where it goes, which existing pattern to copy, and its testing and Upptime gates                                                                                         |
| UI — [docs/app-development/ui/](./docs/app-development/ui/)                      | `ui-app-pattern.md`, `auth/*`, `deployment/*`                                                                                                                                                                                        |
| API — [docs/app-development/api/](./docs/app-development/api/)                   | `deployment/fly-service-pattern.md`                                                                                                                                                                                                  |
| [app-readme-pattern.md](./docs/app-readme-pattern.md)                            | The format every app/publishing lib's `README.md` follows; read first before adding or updating one                                                                                                                                  |
| [repo-operations.md](./docs/repo-operations.md)                                  | Operations map: the Terraform/VM/observability inventory, where each app's state lives and its backup rule, the local dev stack, and service-to-service auth                                                                         |
| [notes-pattern.md](./docs/notes-pattern.md)                                      | Read first before adding or editing files under `notes/`; per-topic conventions live under `docs/notes/`                                                                                                                             |
| [learning-timeline.md](./docs/learning-timeline.md)                              | Month-by-month record of what was being learned; extend the current month's row when work lands that introduces a new topic                                                                                                          |
| [network-management.md](./docs/infrastructure/network-management.md)             | Read first before changing DNS, domains, proxying, tunnels, or VPN                                                                                                                                                                   |
| [jellyfin-pi.md](./docs/infrastructure/jellyfin-pi.md)                           | The Ansible-provisioned homelab Pi running Jellyfin; read first before provisioning or changing hardware on the LAN (there is no Terraform for it)                                                                                   |
| [secret-management.md](./docs/infrastructure/secret-management.md)               | Read first before adding, rotating, or relocating a secret, or adding a local `.env`/`.tfvars` file; owns the tier hierarchy, per-tier key inventory, Vault access from CI and locally, and per-key rotation mechanisms              |
| [free-tier-infrastructure.md](./docs/infrastructure/free-tier-infrastructure.md) | Every cloud service the repo uses, its free-tier allowance, and how much of it the repo's own config accounts for; read first before adopting a new cloud service or sizing a new VM, and update the affected row in the same change |
| [nuance-pattern.md](./docs/nuance-pattern.md)                                    | Read first before recording a nuance or editing a directory-scoped `CONTEXT.md`; a nuance lives in the `## Nuances` section of the deepest directory it affects, and a repo-wide one in this file's own `## Nuances`                 |
| [refactor-code-cleanup.md](./docs/refactor-code-cleanup.md)                      | Cleanup checklist behind `/refactor-code-cleanup` and unattended `agentic:task:solve` runs                                                                                                                                           |
| [TODO.md](./TODO.md)                                                             | Repo audit backlog                                                                                                                                                                                                                   |
| [todo-pattern.md](./docs/todo-pattern.md)                                        | Read first before adding or editing a `TODO.md` row; single source for its format and the id contract the sandbox scripts parse                                                                                                      | T   |

## Dev Tooling

### Root Scripts Conventions

- Useful infra-level CLI commands (SSH, logs, deploys, resets, service management) should be added as scripts in the root `package.json`.
- The cheatsheet (`docs/cheatsheet.md`, linked from the README, printed via `scripts/shell/cheatsheet.sh` / `pnpm run cheatsheet`) must reflect the root `package.json` scripts — update it when adding, renaming, or removing scripts. `docs/cheatsheet.md` is the source of truth; `cheatsheet.sh` only prints its fenced code block and must not be edited to add content directly.
- The alias cheatsheet (`docs/cheatsheet-aliases.md`, printed via `scripts/shell/cheatsheet-aliases.sh` / `pnpm run cheatsheet:aliases`, and by the `cheatsheet` shell function in `setup/dotfiles/zsh/aliases/vigilant-broccoli_aliases.sh`) must reflect the aliases and functions under `setup/dotfiles/` — update it when adding, renaming, or removing one. Same rule as above: the markdown is the source of truth and the `.sh` only prints its fenced code block.

### Toolchain

- Tool versions are pinned in the root `mise.toml` (Node via `.nvmrc`); `mise install` from the repo root installs them and `mise activate` in `.rc.zsh`/`.rc.bash` puts them on `PATH` inside the repo. Bump a version there rather than in Homebrew — see [workflow-conventions.md](./docs/ci/workflow-conventions.md#toolchain-versions) for how workflows read the same file.

## CI

- Never introduce a new GitHub Actions repo secret, and remove unused ones. `GCP_SERVICE_ACCOUNT` and `GCP_WORKLOAD_IDENTITY_PROVIDER` are the only required ones; every other credential comes from GCP Secret Manager or Vault. The reasoning, and the rest of the workflow conventions, are in [workflow-conventions.md](./docs/ci/workflow-conventions.md) — read it before adding or changing a workflow.
- Migrations: [database-migrations.md](./docs/ci/database-migrations.md). Infrastructure-as-code and drift detection: [terraform.md](./docs/ci/terraform.md).

## App Development

- For HTTP-related literals (methods, headers, status codes, common header names), prefer the shared consts in `libs/@vigilant-broccoli/common-js/src/lib/http/http.consts.ts` (`HTTP_METHOD`, `HTTP_HEADERS`, `HTTP_STATUS_CODES`, etc.) over defining local equivalents.
- For personal identity links and contact details (social profiles, the personal email address, community sites), prefer the shared consts in `libs/@vigilant-broccoli/personal-common-js/src/index.ts` (`SOCIAL_LINK`, `EMAIL_ADDRESS`, `SENDER_EMAIL_ADDRESS`, `EMAIL_LINK`, `COMMUNITY_LINK`, `PERSONAL_URL`) over hardcoding them per app — several apps surface the same profiles, and a moved account should only need one edit. Keep them out of `@vigilant-broccoli/links`, whose ops registry (cloud account ids, dashboard URLs) must never be imported into a public client bundle. Auth allowlists and API-key seed identities stay literal on purpose — they happen to equal the contact address today, and importing it would make a change of contact address silently move who can log in. Google Calendar ids live in `GOOGLE_CALENDAR.CALENDAR_EMAIL` in `@vigilant-broccoli/common-browser`.
- For accessing environment variables server-side, prefer `getEnvironmentVariable` from `@vigilant-broccoli/common-node` over `process.env` directly. Exception: `NEXT_PUBLIC_` vars accessed client-side must use `process.env.NEXT_PUBLIC_*` direct property access — Next.js can only statically inline them at build time with direct access, not through a wrapper function.
- Never declare a dependency as `"*"` (or an exact/stale pin that differs from root) in a lib/app `package.json` for a package already pinned in the workspace root `package.json` — mirror the root's caret range instead. pnpm only re-resolves an importer when its own specifier changes, so a `"*"` copy can silently drift to a different resolved version once root is bumped, surfacing as a confusing type error (e.g. two `fastify` versions producing incompatible `FastifyInstance` types) instead of an obvious version mismatch; matching caret ranges let pnpm dedupe to one resolved version. Do NOT use `overrides` in `pnpm-workspace.yaml` to force versions for packages consumed by the fly services — it breaks their pruned installs (rationale in [fly-service-pattern.md](./docs/app-development/api/deployment/fly-service-pattern.md)).
- A `libs/@vigilant-broccoli/*` lib publishes to npm iff its `project.json` defines a `publish-package` target — `publishConfig` in `package.json` alone does nothing. Before adding or changing npm publishing, follow the npm package publishing steps in [app-development.md](./docs/app-development/app-development.md#npm-package-publishing) (reference libs, target wiring, `NPM_TOKEN` requirements, first-publish constraints).

### UI

- For UI applications, read [ui-app-pattern.md](./docs/app-development/ui/ui-app-pattern.md) first — it owns the binding UI requirements (prefer `@vigilant-broccoli/react-lib` shared components over hand-rolling, i18n via the shared `createI18n` for all user-facing copy, user-facing auth via `createSupabaseAuth`, a card on the pages-index "UI Apps" page) and routes to the per-destination deploy and auth pattern docs alongside it.

### API

- For anything touching fly.io services in `apps/api/*` (adding/modifying a service, smoke targets, fly configs, image delivery), read [fly-service-pattern.md](./docs/app-development/api/deployment/fly-service-pattern.md) first.
- Every fly.io service in `apps/api/*` exposes Swagger docs at `/docs` via `createDocsPlugin` from `@vigilant-broccoli/fastify`, with its OpenAPI spec built by `createSwaggerSpec` in the service's `src/libs/swagger.ts` (`src/swagger.ts` in the email services). When adding, removing, or changing a service's routes (paths, methods, request/response shapes, auth), update that swagger spec in the same change.

### Documentation

- Each app under `apps/*`, and each `libs/@vigilant-broccoli/*` lib that publishes to npm, carries a `README.md` following [app-readme-pattern.md](./docs/app-readme-pattern.md) (title, one-line purpose, `## Stack`); keep it in sync with the code — in particular, add or remove a deploy destination (Docker Hub, npm, Fly.io, Vercel, …) under Cloud services in the same change that wires or unwires it. Run `/update-readmes` to review and refresh them all.
- Feature docs live in a `docs/features/<feature>/` folder nearest the code that implements them — under the owning app (`apps/hearth/docs/features/`, `apps/ui/vb-manager-next/docs/features/`) or lib (`libs/@vigilant-broccoli/react-lib/docs/features/`), never at the workspace root for something one app owns. `projects/nx-workspace/docs/features/` is reserved for features that genuinely span apps (today: `dev-dashboard/`). `/update-feature-documentation` writes them.

## Git

- Never commit or push unless explicitly instructed to.
- **Staging**: stage only the files created or edited in the current session — never `git add -A` or `git add .`, and never files that were already modified or untracked before the session began, even if they look related.
- **Safety**: never force-push, never skip hooks, never amend existing commits.
- **This working tree may be shared.** Claude Code and Codex sessions attached to one checkout share the index, `HEAD`, and the stash. Establish ownership before branching, staging, committing, stashing, or switching branches; never stash in a shared or uncertain checkout, because a stash takes other sessions' uncommitted work with it; and commit by pathspec (`git commit -m "<message>" -- <your paths>`) when anything you do not own is staged. Full rules in [git-workflow.md](./docs/git-workflow.md#concurrent-agent-sessions).
- Branch, staging, commit, PR and `main`-sync conventions live in [git-workflow.md](./docs/git-workflow.md) — read it before committing or pushing. Repository protection, bypass actors and GitHub App scopes live in [github-repo-protection.md](./docs/infrastructure/github-repo-protection.md).

## Coding Conventions

- Prefer functional programming patterns over OOP.
- Avoid excessive try/catch blocks; only add error handling when explicitly needed.
- Avoid string literals, prefer having consts.
- Do not write tests unless explicitly asked.
- Comments have to earn their place. Write one only when it says something the code cannot: why a non-obvious approach was chosen, an external constraint or API quirk, a gotcha, or a worked example. Never add one that restates the next line (`// Get the last part after slash`), labels a block with its own code's words (`// Helper function to ...`, `// Start a single container`), or explains a self-describing config flag (`agentRules: false`) — that rationale goes in the commit message or the relevant `docs/` page, not the file. Two exceptions: keep a comment that is the sole body of an otherwise-empty block (an intentional empty `catch`), and leave `TODO`/`FIXME`/lint-directive comments alone. Generator scaffolding (`// Add more Next.js plugins to this list if needed.`) is noise — delete it when you touch the file.
- If a PR touches files for a cloud service, or introduces/changes usage of one, add or update a `## Free Tier` section in that service's notes/docs file documenting its free tier limits (e.g. [github-actions.md](./notes/tech/software/web-dev/devops/automation/github-actions.md)).
- Before working on an app or directory, read any `CONTEXT.md` (exposed as `AGENTS.md` and `CLAUDE.md`) along the path from the repository root to that directory; do not assume the session loaded guidance below its starting directory. Check its `README.md` for an `## Agent Context` section and follow any upkeep instructions it lists (e.g. keeping a Page Navigation section in sync with the routes).
- A directory that records non-obvious traps carries them as a `## Nuances` section of its own `CONTEXT.md`, exposed through the agent entry points in that directory. Read the entry covering the surface you are about to touch before writing the code, not after something breaks. `grep -rl '^## Nuances' --include=CONTEXT.md .` lists every directory that has one.

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
