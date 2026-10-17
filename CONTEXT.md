# Agent Context

Shared repository guidance. Edit `CONTEXT.md`; `AGENTS.md` is a relative symlink to it.

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

## Doc Map

Read the relevant document before working on its subject. Before editing a directory, read every `CONTEXT.md` along its path, including applicable `## Nuances` entries, and follow any `## Agent Context` upkeep instructions in its `README.md`.

| Doc                                                                              | When to read / upkeep                                                                                      |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [agent-support.md](./docs/agent-support.md)                                      | Agentic operations, skills, adapters and entry-point parity.                                               |
| [app-development.md](./docs/app-development/app-development.md)                  | Adding apps/libs, deployment, public URLs or npm publishing.                                               |
| [app-readme-pattern.md](./docs/app-readme-pattern.md)                            | README edits and generated repo counts.                                                                    |
| [career experience](./notes/personal/personal-software-career-experience.md)     | New skill or area (e.g. mobile development) absent from its Skills or contributions: add it.               |
| [code-quality-tools.md](./docs/code-quality-tools.md)                            | Quality tooling; update its inventory when adding/removing a tool.                                         |
| [database-migrations.md](./docs/ci/database-migrations.md)                       | Database migrations.                                                                                       |
| [fork-identity-inventory.md](./docs/fork-identity-inventory.md)                  | Making the repo forkable; update when adding or removing a hardcoded account, domain or identity value.    |
| [free-tier-infrastructure.md](./docs/infrastructure/free-tier-infrastructure.md) | New cloud services or VM sizing; update the affected allowance row.                                        |
| [git-workflow.md](./docs/git-workflow.md)                                        | Branching, staging, commits, PRs and syncing main.                                                         |
| [github-repo-protection.md](./docs/infrastructure/github-repo-protection.md)     | GitHub protection, bypass actors or push rejections.                                                       |
| [jellyfin-pi.md](./docs/infrastructure/jellyfin-pi.md)                           | LAN hardware provisioning via Ansible.                                                                     |
| [learning-timeline.md](./docs/learning-timeline.md)                              | Extend the current month when work introduces a new topic.                                                 |
| [network-management.md](./docs/infrastructure/network-management.md)             | DNS, domains, proxies, tunnels or VPN.                                                                     |
| [nuance-pattern.md](./docs/nuance-pattern.md)                                    | Directory context edits or recording a non-obvious trap.                                                   |
| [refactor-code-cleanup.md](./docs/refactor-code-cleanup.md)                      | Diff cleanup checklist.                                                                                    |
| [repo-operations.md](./docs/repo-operations.md)                                  | Infrastructure inventory, persistence, backups, local stack and service auth.                              |
| [secret-management.md](./docs/infrastructure/secret-management.md)               | Secrets, local `.env`/`.tfvars` or Terraform GitHub tokens; update its secret inventory as secrets change. |
| [terraform.md](./docs/ci/terraform.md)                                           | Infrastructure changes, local applies and drift detection.                                                 |
| [todo-pattern.md](./docs/todo-pattern.md)                                        | [TODO.md](./TODO.md) backlog edits and the id contract.                                                    |
| [upptime.md](./docs/infrastructure/upptime.md)                                   | Monitoring configuration and its isolated repository.                                                      |
| [workflow-conventions.md](./docs/ci/workflow-conventions.md)                     | Workflow changes, including agentic run summaries.                                                         |

## Dev Tooling

### Root Scripts Conventions

- Put useful infrastructure commands in the root `package.json`.
- Keep [docs/cheatsheet.md](./docs/cheatsheet.md) in sync with root scripts and [docs/cheatsheet-aliases.md](./docs/cheatsheet-aliases.md) with aliases/functions under `setup/dotfiles/`. Edit the Markdown sources; their shell scripts only print them.

### Toolchain

Tool versions belong in root `mise.toml` (Node in `.nvmrc`), not Homebrew. Run `mise install` from the repo root.

## CI

Never add GitHub Actions repo secrets; remove unused ones. Only `GCP_SERVICE_ACCOUNT` and `GCP_WORKLOAD_IDENTITY_PROVIDER` are required; other credentials come from GCP Secret Manager or Vault. Workflow requirements live in [workflow-conventions.md](./docs/ci/workflow-conventions.md).

## App Development

- Prefer HTTP consts from `@vigilant-broccoli/common-js` (`HTTP_METHOD`, `HTTP_HEADERS`, `HTTP_STATUS_CODES`).
- Personal links and contact details belong in `@vigilant-broccoli/personal-common-js`. Keep auth allowlists and API-key seed identities literal so a contact change cannot change access. Never import the `@vigilant-broccoli/links` ops registry into public client bundles. Personal calendar ids (`PERSONAL_GOOGLE_CALENDAR`, `PERSONAL_CALENDAR_SOURCES`) live there too; `@vigilant-broccoli/common-browser` stays public and personal-detail free.
- Prefer `getEnvironmentVariable` from `@vigilant-broccoli/common-node` for server environment variables. Client-side Next.js variables require direct `process.env.NEXT_PUBLIC_*` access for build-time inlining.
- App/lib dependencies already pinned in the workspace root must mirror its caret range; no `"*"` or divergent pins. pnpm re-resolves an importer only when its own specifier changes, so a stray copy drifts after root bumps and surfaces as confusing duplicate-type errors (e.g. incompatible `FastifyInstance` types). Do not force Fly service dependencies through `pnpm-workspace.yaml` overrides: pruned installs fail.
- New or changed public URLs require synchronized Upptime entries, pages-index cards and browser quick links for every environment and demo; follow [public URL registration](./docs/app-development/app-development.md#deployment).

### UI

Read [ui-app-pattern.md](./docs/app-development/ui/ui-app-pattern.md) before UI app work; it links the deployment and auth patterns.

### API

Read [fly-service-pattern.md](./docs/app-development/api/deployment/fly-service-pattern.md) before changing Fly services (`apps/api/*`), smoke targets, Fly configs or image delivery. Services expose `/docs` through `createDocsPlugin` from `@vigilant-broccoli/fastify`. Keep the `createSwaggerSpec` in `src/libs/swagger.ts` (`src/swagger.ts` for email services) in sync with route paths, methods, request/response shapes and auth.

### Documentation

- Keep requested Markdown-table content in the table; add no surrounding prose unless requested.
- Alphabetize unordered tables by their first column. Preserve meaningful order for steps, progressions, diagram labels and fixed side-by-side comparisons whose heading names the order.
- Check relative links and section anchors after moving files or renaming headings.
- This file and Doc Map documents with at least three `##` sections need a `## Table of Contents` after the one-line purpose. Derive it from headings in document order, nesting `###` entries and ignoring fenced examples; rebuild it when headings change and add a missing one when touching a listed doc. READMEs follow `app-readme-pattern.md` and stay deployment-agnostic (no hosted URLs or deploy targets; Stack groups ordered, items sorted, no parentheticals, optional ` - description` only when the name is ambiguous); notes follow [notes/CONTEXT.md](./notes/CONTEXT.md). Do not add ToCs to unrelated files.
- Feature docs belong in `docs/features/<feature>.md` (a `<feature>/` folder only when it needs several files) under the owning app/lib. Only features spanning apps belong in `projects/nx-workspace/docs/features/`.
- When changing a cloud service or its usage, update its notes/docs `## Free Tier` section with the limits.

## Git

- Never commit or push unless explicitly instructed. Never force-push, skip hooks or amend existing commits.
- Stage only files created or edited in this session; never `git add -A`, `git add .`, or files already modified/untracked before the session.
- Treat the checkout as shared unless provably exclusive; if not provable, use a separate worktree off fresh `origin/main` with only your changes. Establish ownership before branching, staging, committing, stashing or switching branches. Never stash in a shared or uncertain checkout. If others' work is staged, commit only your paths with `git commit -m "<message>" -- <your paths>`.
- Read [git-workflow.md](./docs/git-workflow.md) before changing Git state or publishing PRs.

## Coding Conventions

- Prefer functional patterns over OOP and consts over string literals. Add error handling only when explicitly needed.
- Do not write tests unless explicitly asked.
- Never create import cycles; `import/no-cycle` fails lint. Inside a lib, import from the sibling module, never from the lib's own `index.ts`.
- Comments should explain non-obvious reasons, constraints or traps. Remove redundant comments and generator scaffolding when touching a file. Preserve comments that are an empty block's sole body, and `TODO`/`FIXME`/lint directives.
