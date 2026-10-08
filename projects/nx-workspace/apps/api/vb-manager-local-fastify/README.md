# VB Manager Local API

Local-only Fastify API behind VB Manager: serves every `/api` route and, in production, the [`vb-manager-local-react`](../../ui/vb-manager-local-react/README.md) build from one PM2 process on `127.0.0.1:1337`. It is not a fly.io service and has no `deploy` target.

## Table of Contents

- [Stack](#stack)
- [Agent Context](#agent-context)
- [Migration verification](#migration-verification)

## Stack

- Language - TypeScript
- Framework - Fastify
- Build Tool - esbuild
- External libs
  - `@fastify/static`
  - `@fastify/rate-limit`
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

## Migration verification

- [Route inventory](./docs/migration-routes.md): all 90 original API paths and 116 methods retain their URLs and methods.
- From `projects/nx-workspace`, run `nx run-many -t build lint test typecheck -p vb-manager-local-fastify,vb-manager-local-react` and `nx run vb-manager-local-react:e2e -- --project=default`.
- The API auth suite covers unauthenticated shell, Docker, PM2 and SSH routes, invalid tokens, valid tokens and the `/api/auth/*` exemption.
- API requests are limited to 600 requests per minute per client IP before token validation; static files and Swagger remain unlimited.
- Production smoke: boot the bundle with dummy service values, `PORT` and `STATIC_DIR`; `/settings` returns the SPA, protected routes return 401, `/api/auth/google-token` reaches its own handler, and `/docs` plus `/docs/json` return Swagger.
