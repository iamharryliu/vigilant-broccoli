# APP_DEVELOPMENT

- For HTTP-related literals (methods, headers, status codes, common header names), prefer the shared consts in `libs/@vigilant-broccoli/common-js/src/lib/http/http.consts.ts` (`HTTP_METHOD`, `HTTP_HEADERS`, `HTTP_STATUS_CODES`, etc.) over defining local equivalents.
- For accessing environment variables server-side, prefer `getEnvironmentVariable` from `@vigilant-broccoli/common-node` over `process.env` directly. Exception: `NEXT_PUBLIC_` vars accessed client-side must use `process.env.NEXT_PUBLIC_*` direct property access — Next.js can only statically inline them at build time with direct access, not through a wrapper function.
- Never declare a dependency as `"*"` (or an exact/stale pin that differs from root) in a lib/app `package.json` for a package already pinned in the workspace root `package.json` — mirror the root's caret range instead. pnpm only re-resolves an importer when its own specifier changes, so a `"*"` copy can silently drift to a different resolved version once root is bumped, surfacing as a confusing type error (e.g. two `fastify` versions producing incompatible `FastifyInstance` types) instead of an obvious version mismatch; matching caret ranges let pnpm dedupe to one resolved version. Do NOT use `overrides` in `pnpm-workspace.yaml` to force versions for packages consumed by the fly services — it breaks their pruned installs (rationale in [fly-service-pattern.md](./api/deployment/fly-service-pattern.md)).
- A `libs/@vigilant-broccoli/*` lib publishes to npm iff its `project.json` defines a `publish-package` target — `publishConfig` in `package.json` alone does nothing. Before adding or changing npm publishing, follow the npm package publishing steps in [repo-patterns.md](./repo-patterns.md) (reference libs, target wiring, `NPM_TOKEN` requirements, first-publish constraints).
- Each app under `apps/*` carries a `README.md` following [app-readme-pattern.md](./app-readme-pattern.md) (title, one-line purpose, `## Stack`); keep it in sync with the code. Run `/update-readmes` to review and refresh them all.
  D

## UI

- For UI applications, read [ui-app-pattern.md](./ui/ui-app-pattern.md) first — it owns the binding UI requirements (prefer `@vigilant-broccoli/react-lib` shared components over hand-rolling, i18n via the shared `createI18n` for all user-facing copy, user-facing auth via `createSupabaseAuth`, a card on the pages-index "UI Apps" page) and routes to the per-destination deploy and auth pattern docs alongside it.

## API

- For anything touching fly.io services in `apps/api/*` (adding/modifying a service, smoke targets, fly configs, image delivery), read [fly-service-pattern.md](./api/deployment/fly-service-pattern.md) first.
- Every fly.io service in `apps/api/*` exposes Swagger docs at `/docs` via `createDocsPlugin` from `@vigilant-broccoli/fastify`, with its OpenAPI spec built by `createSwaggerSpec` in the service's `src/libs/swagger.ts` (`src/swagger.ts` in the email services). When adding, removing, or changing a service's routes (paths, methods, request/response shapes, auth), update that swagger spec in the same change.
