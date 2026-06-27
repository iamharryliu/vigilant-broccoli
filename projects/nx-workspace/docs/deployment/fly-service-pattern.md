# Fly.io service pattern

Niche gotchas for `projects/nx-workspace/apps/api/*` fly.io services. For boilerplate, copy from a reference app.

Reference apps (each demonstrates a different combination):

- `apps/api/llm-service/` — pruned + `flyctl deploy --dockerfile` (fly builds image)
- `apps/api/bucket-service/` — pruned + Docker Hub roundtrip (`deploy-container` pushes to `iamharryliu/bucket-service`, then `flyctl deploy --image`). Note: outputs to `dist/bucket-service`, not `dist/apps/api/bucket-service`.
- `apps/api/email-service/`, `apps/api/email-subscription-service/` — bundled + Docker Hub roundtrip
- `apps/api/vb-express/` — **legacy, not yet on this pattern**: pruned, no `smoke` target, no `[[http_service.checks]]` block. Don't copy from it.

## Two orthogonal axes

**Build shape:**

- **Bundled** (`@nx/esbuild:esbuild`, `bundle: true, thirdParty: true`): single `main.js`, no Dockerfile install.
- **Pruned** (`@nx/webpack:webpack` + `prune-lockfile` + `copy-workspace-modules`): `main.js` + `package.json` + `pnpm-lock.yaml` + `workspace_modules/`, Dockerfile runs `pnpm install --frozen-lockfile --prod`. Pick only when bundling is impractical.

**Image delivery:**

- **Direct**: `deploy` runs `flyctl deploy --dockerfile ...`, fly builds the image.
- **Docker Hub roundtrip**: `deploy-container` runs `docker buildx ... --push iamharryliu/<svc>` (tags `latest` and `${COMMIT_SHA}`), then `deploy` runs `flyctl deploy --image iamharryliu/<svc>:${COMMIT_SHA}`.

## Transitive-dep gotcha (pruned only)

`@nx/js:prune-lockfile` only includes deps **directly listed** in `apps/api/<svc>/package.json`. If a workspace lib (e.g. `@vigilant-broccoli/fastify`) has a runtime dep (e.g. `fastify-plugin`) that ends up as an externalized `require(...)` in `main.js`, that dep must also be listed in the consuming service's `package.json`. Otherwise: `Cannot find module` at boot → 502 → e2e fail. `@nx/dependency-checks` lint does NOT catch this; the `smoke` target does.

## Smoke target

Every new service must have `smoke` between build and deploy (vb-express predates this rule). Runs `scripts/shell/smoke-dist.sh <dist-dir>`. Behavior:

1. rsyncs dist to `/tmp` **excluding `node_modules`** — prevents Node's resolver from walking up into the workspace root's `node_modules` and masking missing deps.
2. If `package.json` present, runs `pnpm install --frozen-lockfile --prod --ignore-workspace --ignore-scripts`.
3. Boots with dummy `SHARED_APP_TOKEN`, `RESEND_API_KEY`, `SUPABASE_SECRET_KEY`. Polls `GET /` for 20s.

If a new service needs more env vars to clear top-level init, add them to the script. **Top-level module init must not require live network or secrets** — defer to per-request.

Wiring: pruned `smoke` depends on `prune`; bundled `smoke` depends on `build`. `deploy` / `deploy-container` depends on `smoke`.

## Health check

- `GET /` must be unauthenticated, fast, no DB/LLM calls. Pattern: `reply.send({ service: SERVICE_NAME, docs: DOCS_PATH })`.
- `grace_period = '30s'` is required to cover cold-start under `auto_stop_machines = 'stop'`.
- Failed checks on a new machine abort the deploy and keep the previous machine running — don't skip the `[[http_service.checks]]` block.

## Secrets

Declare in `projects/nx-workspace/scripts/secrets-mapping.config.ts`. `nx deploy:secrets <svc>` reads Vault → `flyctl secrets set`. `deploy` depends on `deploy:secrets`.
