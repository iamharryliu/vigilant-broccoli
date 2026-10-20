# README Stack Pattern

Every app under `projects/nx-workspace/apps/*`, every component under `infrastructure/*`, and every `libs/@vigilant-broccoli/*` lib that publishes to npm (has a `publish-package` target — see [app-development.md](./app-development/app-development.md#npm-package-publishing)) carries a `README.md` with a title, a one-line purpose, a `## Table of Contents`, and a `## Stack` section. Keep it minimal — headers + bullets, no prose. App and lib READMEs are deployment-agnostic: no hosted URLs or dashboard links; public URLs live in the root `## Applications` inventory and the pages-index registry. Derive everything from the actual code and config so newly introduced tech shows up, and update sections in place rather than duplicating.

## Table of Contents

- [Generating a README's ToC](#generating-a-readmes-toc)
- [Apps and publishable libs](#apps-and-publishable-libs)
- [Infrastructure](#infrastructure)
- [Aggregate](#aggregate)

## Generating a README's ToC

Every README gets a `## Table of Contents` right after the one-line purpose, linking to each `##` header that follows it, in document order. Regenerate it whenever headers are added, removed, or reordered — it's the one section that's fully derived, safe to rebuild from scratch every run.

## Apps and publishable libs

Each app under `projects/nx-workspace/apps/*`, and each `libs/@vigilant-broccoli/*` lib with a `publish-package` target, has a `README.md` with:

- `# <Title>` — human-readable name (title case, not the dir/package slug)
- One line on what it does (skip if the title already says it)
- `## Table of Contents`
- `## Stack` — a bullet list grouped into these levels, in order:
  - **Language** — e.g. TypeScript
  - **Framework** — the app framework, e.g. Next.js, Fastify, React
  - **Build Tool** — the bundler/builder, e.g. Vite, Next.js, esbuild, webpack
  - **External libs** — other third-party npm packages: UI libs, SDKs, tooling
  - **Internal libs** — the `@vigilant-broccoli/*` VB libs it consumes
  - **Cloud services** — hosted/managed platforms and external APIs it calls at runtime (e.g. Supabase, Sanity, AWS S3, Stripe). Never list where it is hosted or published (Vercel, Cloudflare Pages, Fly.io, Docker Hub, npm, GitHub Pages): the README is deployment-agnostic.

Language, Framework, and Build Tool each hold a single value, written inline (`- Language - TypeScript`). External libs, Internal libs, and Cloud services are nested bullet lists.

Stack conventions, for apps, libs and infrastructure alike:

- Groups appear in the listed order; omit empty ones.
- Framework and Build Tool are the bare tool name, with no parenthetical (`Next.js`, not `Next.js (React)`).
- Items inside a nested group are sorted alphabetically, case-insensitively and ignoring backticks. A multi-value Language keeps its primary-first order.
- One tool per bullet, named bare, with no parentheticals. Append ` - <description>` only when the name alone is ambiguous or hides how it is used (`- PostgreSQL - pgvecto-rs vector search`, `- Email Service - called over HTTP`): a short lowercase fragment, no trailing period, at most six words. Most bullets need none; never add one for purpose notes the name already implies. On an inline single-value group the description follows the value (`- Framework - Slack Bolt - Socket Mode`).

Classify by nature, not name: a client SDK is an external lib, but the platform or API it talks to is a cloud service — list the service, not its SDK. Framework and Build Tool may be the same tool (e.g. Next.js); list it in both. Derive everything from `package.json`, imports, env vars, and config. Omit a group only when the app genuinely has nothing for it.

Example:

```md
## Table of Contents

- [Stack](#stack)

## Stack

- Language - TypeScript
- Framework - React
- Build Tool - Vite
- External libs
  - Tailwind CSS
- Internal libs
  - `common-js`
  - `react-lib`
- Cloud services
  - Supabase
```

## Infrastructure

Each component under `infrastructure/*` (e.g. `terraform`, `local`, `agent-sandbox`) has a `README.md` with:

- `# <Component Title>` — human-readable name
- One line on what it provisions or runs (skip if the title already says it)
- `## Table of Contents`
- `## Networking` — optional; a bullet list of externally reachable service URLs this component proxies or exposes (e.g. via nginx, Cloudflare Tunnel), one per line: `- [host](https://host/) - what it's for`. Manually curated, not derived from code — `/update-readmes` must never delete or invent entries here. Only add an entry when the user gives you the URL, and only fix an entry the user confirms is broken or stale.
- `## Observability` — optional; curated notes on how logs/metrics flow through this component (sources, pipeline, retention/rotation config) that a Stack bullet list can't capture. Same curation rule as Networking: manually maintained, never derived or invented by `/update-readmes`.
- `## Stack` — a bullet list grouped into these levels, in order:
  - **Language** — the config/scripting language, e.g. HCL, YAML, Bash (inline when single)
  - **Tooling** — IaC and container tooling, e.g. Terraform, Packer, Docker, Docker Compose
  - **Cloud providers** — platforms it provisions or targets, e.g. Cloudflare, Google Cloud, Oracle Cloud, Supabase, GitHub
  - **Services** — the containers/processes it runs, e.g. Grafana, Loki, Promtail, Immich, Resilio Sync, Caddy, nginx, Adminer
  - **Secrets** — the secrets backend it reads, e.g. HashiCorp Vault, Google Secret Manager

Same rules as apps: single-value groups written inline, the rest nested; classify by nature; omit a group only when there is genuinely nothing for it. Derive everything from `*.tf` provider/resource blocks, `docker-compose.yml`, `Dockerfile`, and scripts — so a newly added Terraform provider or compose service shows up.

Networking and Observability only apply to components that actually have externally reachable services or a curated logging story — most infra components omit both and carry only Stack. When a component has its own directory-scoped `CONTEXT.md` (e.g. `infrastructure/local/CONTEXT.md`), that file is the authority on which of these sections apply to it and how to curate them. Its `## Nuances` section is not README guidance — that records traps per [nuance-pattern.md](./nuance-pattern.md) and `/update-readmes` neither reads nor rewrites it.

Example (`infrastructure/terraform`):

```md
## Table of Contents

- [Stack](#stack)

## Stack

- Language - HCL
- Tooling
  - Packer
  - Terraform
- Cloud providers
  - Cloudflare
  - Google Cloud
  - Oracle Cloud
  - Supabase
  - GitHub
```

## Aggregate

The root `README.md` carries a `## Table of Contents` and a `## Stack` section — the repo-wide roll-up of everything above, written as a two-column table (`Category | Tools`), one row per category, categories and tools each sorted alphabetically, tool names linked to their homepage where one exists. After refreshing individual READMEs, reconcile it so every technology that appears in any app, publishable-lib, or infrastructure README is represented there.

The root README also carries an `## Applications` section listing every custom application/API service and self-hosted application managed here once, split by who can use it into `### Public` (`Application | Description | URL`), `### Private` (`Application | Description | Access`) and `### Local` (`Application | Description`, for anything with no hosted deployment). Sort each table alphabetically by display name; staging and production share a row. A public row's URL is its configured production URL. A private row's Access is its restriction type followed by its production URL or endpoint, hyphen-separated (e.g. `Cloudflare Access - code.harryliu.dev`, `Fly Network - production-storage-service`), or the bare URL when there's no restriction type to name: label private-network endpoints rather than inventing a URL. Keep this inventory current when an app, deployment, or access policy changes. Prefix each name with the app's own icon (`<img src="./<app>/<icon>" width="20" height="20" align="absmiddle">`, preferring `apple-touch-icon.png`/`apple-icon.png`, else `icon.svg`) and omit it for rows without an icon file; relative paths render on GitHub and in pages-index (which rewrites them to raw GitHub URLs).

The root README also carries a `## Libraries` section listing every Nx library under `projects/nx-workspace/libs/*/*` once, as `Library | Description | Tags`: the package name linked to its directory, a one-line description of what it holds, and its `project.json` tags. Sort by package name ignoring the leading `@`. Add, remove or update the row in the same change that adds, removes, renames, retags or repurposes a lib.

The root README's opening paragraph is itself a generated repo-stats sentence (each copy has its own wording template in the script) between `<!-- managed:repo-stats:start -->` / `<!-- managed:repo-stats:end -->` markers, also generated into `personal-website-react`'s `about.md`. The resume's `vigilant-broccoli` bullet in `resume.json` ("Open source maintainer of …") carries the same counts, rewritten in place by the script's number pattern; the surrounding wording is hand-edited, so keep it to one line and don't name the monorepo tool (Nx) in it. The resume must fit one page: `generateResumePdfBuffer` throws when the PDF exceeds one page, which fails `personal-website-react`'s `pre-build`. Never hand-edit the counts: `pnpm repo-stats` (`scripts/node/repo-stats.mjs`) rewrites all three copies, and the `repo-stats` pre-commit hook runs it on every commit, so a stale copy is fixed and the commit stops once for re-staging (agents: stage the rewritten files and commit again). `ci-pr-check`'s `pre-commit` job fails if a copy was still stale. Its counts come from:

- **Applications** — distinct `href`s across both lists of the pages-index registry `src/app/consts/webApplications.json` (the curated public apps and demos from [Public URL registration](./app-development/app-development.md#deployment)). `WebApplicationsPage.tsx` renders the cards from the same file, so add, remove or change an application card there, never as inline JSX, or the count drifts.
- **Services** — `apps/api/*` projects with a `deploy` target (fly services; the `mock` directory has none).
- **Docker images** — distinct `iamharryliu/*` Docker Hub images tagged by a pushing command: `docker buildx … --push` in any `project.json` target, or a `.github/workflows/*.yml` that runs `docker push`.
- **npm packages** — `libs/@vigilant-broccoli/*` projects with a `publish-package` target ([npm package publishing](./app-development/app-development.md#npm-package-publishing)).
