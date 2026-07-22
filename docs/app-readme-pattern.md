# README Stack Pattern

Every app under `projects/nx-workspace/apps/*` and every component under `infrastructure/*` carries a `README.md` with a title, a one-line purpose, and a `## Stack` section. Keep it minimal — headers + bullets, no prose. Derive everything from the actual code and config so newly introduced tech shows up, and update sections in place rather than duplicating.

## Apps

Each app under `projects/nx-workspace/apps/*` has a `README.md` with:

- `# <App Title>` — human-readable name (title case, not the dir slug)
- One line on what the app does (skip if the title already says it)
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
- `## Stack` — a bullet list grouped into these levels, in order:
  - **Language** — the config/scripting language, e.g. HCL, YAML, Bash (inline when single)
  - **Tooling** — IaC and container tooling, e.g. Terraform, Packer, Docker, Docker Compose
  - **Cloud providers** — platforms it provisions or targets, e.g. Cloudflare, Google Cloud, Oracle Cloud, Supabase, GitHub
  - **Services** — the containers/processes it runs, e.g. Grafana, Loki, Promtail, Immich, Resilio Sync, Caddy, nginx, Adminer
  - **Secrets** — the secrets backend it reads, e.g. HashiCorp Vault, Google Secret Manager

Same rules as apps: single-value groups written inline, the rest nested; classify by nature; omit a group only when there is genuinely nothing for it. Derive everything from `*.tf` provider/resource blocks, `docker-compose.yml`, `Dockerfile`, and scripts — so a newly added Terraform provider or compose service shows up.

Example (`infrastructure/terraform`):

```md
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

The root `README.md` carries a `## Stack` section — the repo-wide roll-up of everything above, written as grouped nested bullets (category → items). After refreshing individual READMEs, reconcile it so every technology that appears in any app or infrastructure README is represented there.
