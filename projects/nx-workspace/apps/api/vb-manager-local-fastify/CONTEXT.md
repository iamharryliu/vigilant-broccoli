# Agent Context — vb-manager-local-fastify

## Table of Contents

- [Local-only service](#local-only-service)
- [Nuances](#nuances)
  - [PM2 reload needs `pm2 save` for boot resurrect](#pm2-reload-needs-pm2-save-for-boot-resurrect)
  - [The build bundles third-party packages because `qrcode` only resolves from `common-node`](#the-build-bundles-third-party-packages-because-qrcode-only-resolves-from-common-node)

## Local-only service

This project sits under `apps/api/` but is not a fly.io service: it runs only
as the `vb-manager-local-fastify` PM2 process on the host, so it has no
`deploy`, `smoke`, Dockerfile, fly config or Upptime entry, and
[fly-service-pattern.md](../../../../../docs/app-development/api/deployment/fly-service-pattern.md)
does not apply. Nothing that enumerates `apps/api/*` picks it up: `repo-stats`
counts only projects with a `deploy` target, and the fly workflows and secrets
mapping name their services explicitly. Keep it that way — adding a `deploy`
target would make it count as a public API service.

In production one process listens on `127.0.0.1:1337`, serves the
`vb-manager-local-react` build from `STATIC_DIR` (falling back to its
`index.html` for client routes) and every API route under `/api`, so nginx,
the Supabase redirect URLs and the client's relative `fetch('/api/...')` calls
see a single origin. In development `nx serve vb-manager-local-react` runs this
server on port 3003 (3001 and 3002 are the `flyctl proxy` tunnels to
bucket-service and email-service) behind Vite's `/api` proxy.

## Nuances

Non-obvious traps in this directory — read the relevant entry **before**
working on the surface it names, not only when something breaks.
[nuance-pattern.md](../../../../../docs/nuance-pattern.md) is the convention.

### PM2 reload needs `pm2 save` for boot resurrect

`pnpm vb-manager-local-fastify:start` and `pnpm vb-manager-local-fastify:reload`
both register the process from `ecosystem.config.js`, but PM2's boot restore path reads the
saved dump file, not the current in-memory process list. After changing either
target, keep `pm2 save` as the final successful step, or a machine restart can
come back from an older saved list that does not include the fresh
`vb-manager-local-fastify` process/env. This assumes `pm2 startup` has already installed
the OS-level boot hook on the host.

### The build bundles third-party packages because `qrcode` only resolves from `common-node`

`@vigilant-broccoli/common-node` imports `qrcode`, which is declared only in
that lib's own `package.json`, so pnpm installs it under
`libs/@vigilant-broccoli/common-node/node_modules` and not in the workspace
root `node_modules`. A build that leaves npm packages external
(`thirdParty: false`) emits `require("qrcode")` into
`dist/apps/api/vb-manager-local-fastify/main.js`, and the process crashes at
boot with `Cannot find module 'qrcode'`, because Node resolves from `dist/`
upwards and never looks inside the lib's folder. Next.js hid this by bundling
server code by default.

The esbuild `build` target therefore bundles third-party packages and keeps
only the `external` list (`playwright`, `playwright-core`, `chromium-bidi`,
`better-sqlite3`, `socket.io-client`) out of the bundle, the same set the old
`next.config.js` excluded. Those resolve from the workspace root at runtime.
If boot fails with `Cannot find module` after adding a dependency, check
whether it is installed at the workspace root before adding it to `external`.
