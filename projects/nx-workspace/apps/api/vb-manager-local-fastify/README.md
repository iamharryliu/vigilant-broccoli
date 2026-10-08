# VB Manager Local API

Local-only Fastify API behind VB Manager: serves every `/api` route and, in production, the [`vb-manager-local-react`](../../ui/vb-manager-local-react/README.md) build from one PM2 process on `127.0.0.1:1337`. It is not a fly.io service and has no `deploy` target.

## Table of Contents

- [Stack](#stack)
- [Agent Context](#agent-context)

## Stack

- Language - TypeScript
- Framework - Fastify
- Build Tool - esbuild
- External libs
  - `@fastify/static`
  - Supabase JS client
  - MongoDB driver
  - googleapis
  - OpenAI SDK
  - Playwright (event scraper)
  - Socket.IO client
- Internal libs
  - `common-js`
  - `common-node`
  - `devops-cli`
  - `fastify`
  - `github-workspace`
  - `google-workspace`
  - `llm-schemas`
  - `money-movement`
  - `personal-common-js`
  - `resume`
  - `vb-manager-local-common`
  - `vibecheck-lite`
- Cloud services
  - Google OAuth
  - Google Tasks & Calendar
  - MongoDB
  - Supabase
  - Stripe
  - Tailscale
  - OpenAI API
  - Open-Meteo (default weather provider)
  - OpenWeatherMap (alternate weather provider)
  - Self-hosted (PM2)

## Agent Context

- Every `/api/*` route needs `Authorization: Bearer <Supabase access token>`; the top-level `onRequest` hook in `src/libs/auth.hook.ts` enforces it and only exempts `/api/auth/*`. Add routes inside a feature plugin under `src/routes/<feature>/index.ts` so it inherits the `/api` prefix and the hook.
- When adding, removing, or renaming a route, update `API_ROUTES` in `src/libs/swagger.ts` (served at `/docs`) in the same change.
