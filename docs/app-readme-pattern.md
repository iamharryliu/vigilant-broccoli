# App README Pattern

Every app under `projects/nx-workspace/apps/*` has a `README.md` with:

- `# <App Title>` — human-readable name (title case, not the dir slug)
- One line on what the app does (skip if the title already says it)
- `## Stack` — a bullet list grouped into these levels, in order:
  - **Language** — e.g. TypeScript
  - **Framework** — the app framework, e.g. Next.js, Fastify, Angular, React
  - **Build Tool** — the bundler/builder, e.g. Vite, Next.js, esbuild, webpack
  - **External libs** — other third-party npm packages: UI libs, SDKs, tooling
  - **Internal libs** — the `@vigilant-broccoli/*` VB libs it consumes
  - **Cloud services** — hosted/managed platforms and external APIs it deploys to or calls (e.g. Vercel, Cloudflare Pages, Fly.io, Docker Hub, Supabase, Sanity, AWS S3, Stripe)

Classify by nature, not name: a client SDK is an external lib, but the platform or API it talks to is a cloud service — list the service, not its SDK. Framework and Build Tool may be the same tool (e.g. Next.js); list it in both.

Example:

```md
## Stack

- Language
  - TypeScript
- Framework
  - React
- Build Tool
  - Vite
- External libs
  - Tailwind CSS
- Internal libs
  - `common-js`
  - `react-lib`
- Cloud services
  - Supabase
  - Cloudflare Pages
```

Keep it minimal — headers + bullets, no prose. Derive everything from the actual code and dependencies (`package.json`, imports, env vars, config) so newly introduced tech shows up. Omit a group only when the app genuinely has nothing for it. Update sections in place rather than duplicating.
