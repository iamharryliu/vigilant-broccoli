# README Stack Pattern

Every app under `projects/nx-workspace/apps/*` and every component under `infrastructure/*` carries a `README.md` with a title, a one-line purpose, a `## Table of Contents`, and a `## Stack` section. Keep it minimal — headers + bullets, no prose. Derive everything from the actual code and config so newly introduced tech shows up, and update sections in place rather than duplicating.

## Table of Contents

Every README gets a `## Table of Contents` right after the one-line purpose, linking to each `##` header that follows it, in document order. Regenerate it whenever headers are added, removed, or reordered — it's the one section that's fully derived, safe to rebuild from scratch every run.

## Apps

Each app under `projects/nx-workspace/apps/*` has a `README.md` with:

- `# <App Title>` — human-readable name (title case, not the dir slug)
- One line on what the app does (skip if the title already says it)
- `## Table of Contents`
- `## Deployment URLs` — optional; a bullet list of externally hosted resources tied to this app (deployed site, CMS studio/overview, calendars, analytics dashboards, admin consoles, etc.), grouped the same way as Stack (single link inline, related links nested under a group label). This section is manually curated, not derived from code — `/update-readmes` must never delete or invent entries here. Only add an entry when the user gives you the URL, and only fix an entry the user confirms is broken or stale.
- `## Stack` — a bullet list grouped into these levels, in order:
  - **Language** — e.g. TypeScript
  - **Framework** — the app framework, e.g. Next.js, Fastify, Angular, React
  - **Build Tool** — the bundler/builder, e.g. Vite, Next.js, esbuild, webpack
  - **External libs** — other third-party npm packages: UI libs, SDKs, tooling
  - **Internal libs** — the `@vigilant-broccoli/*` VB libs it consumes
  - **Cloud services** — hosted/managed platforms and external APIs it deploys to or calls (e.g. Vercel, Cloudflare Pages, Fly.io, Docker Hub, Supabase, Sanity, AWS S3, Stripe)

Language, Framework, and Build Tool each hold a single value, written inline (`- Language - TypeScript`). External libs, Internal libs, and Cloud services are nested bullet lists.

Classify by nature, not name: a client SDK is an external lib, but the platform or API it talks to is a cloud service — list the service, not its SDK. Framework and Build Tool may be the same tool (e.g. Next.js); list it in both. Derive everything from `package.json`, imports, env vars, and config. Omit a group only when the app genuinely has nothing for it.

Example:

```md
## Table of Contents

- [Deployment URLs](#deployment-urls)
- [Stack](#stack)

## Deployment URLs

- [Deployed Site](https://example.com/)
- Sanity CMS
  - [Overview](https://www.sanity.io/organizations/xxx/project/yyy)
  - [Studio](https://www.sanity.io/@xxx/studio/yyy/default/structure)
- [Analytics](https://analytics.google.com/analytics/web/#/xxx/)

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
  - Cloudflare Pages
```

## Infrastructure

Each component under `infrastructure/*` (e.g. `terraform`, `local`, `homelab`, `agent-sandbox`) has a `README.md` with:

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

Networking and Observability only apply to components that actually have externally reachable services or a curated logging story — most infra components omit both and carry only Stack. When a component has its own directory-scoped `CLAUDE.md` (e.g. `infrastructure/local/CLAUDE.md`), that file is the authority on which of these sections apply to it and how to curate them.

Example (`infrastructure/terraform`):

```md
## Table of Contents

- [Stack](#stack)

## Stack

- Language - HCL
- Tooling
  - Terraform
  - Packer
- Cloud providers
  - Cloudflare
  - Google Cloud
  - Oracle Cloud
  - Supabase
  - GitHub
```

## Aggregate

The root `README.md` carries a `## Table of Contents` and a `## Stack` section — the repo-wide roll-up of everything above, written as grouped nested bullets (category → items). After refreshing individual READMEs, reconcile it so every technology that appears in any app or infrastructure README is represented there.
