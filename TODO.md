# Repo Audit — Outstanding Issues

## P2

### 2. Structural duplication in the workspace

- `personal-website-frontend` vs `personal-website-react`: flip the apex CNAME in `cloudflare-harryliu-dev.tf` to `staging-harryliu-dev-react.pages.dev`, apply + verify, then delete the Angular app and the stale Cloudflare Pages projects.

### 4. Socket-server hardening

- Short-lived JWTs instead of the long-lived `SHARED_APP_TOKEN` — `route.ts` signs `{ exp: +60s }` with a `JWT_SECRET` from Vault, server middleware verifies; optional per-room scope.
- App-level: CORS allowlist via `ALLOWED_ORIGINS` env (currently `*`), payload size cap, last-message cache per room on subscribe.

## P3

### 6. Framework surface

- The Angular 21 toolchain (~25 devDependencies) exists for one app, `cloud-8-skate-angular`. Migrating it to the React/Next stack removes the largest maintenance burden in the workspace.
