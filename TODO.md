# Repo Audit — Outstanding Issues

## P2

### 2. Structural duplication in the workspace

- `personal-website-frontend` vs `personal-website-react`: flip the apex CNAME in `cloudflare-harryliu-dev.tf` to `staging-harryliu-dev-react.pages.dev`, apply + verify, then delete the Angular app and the stale Cloudflare Pages projects.

### 4. Socket-server hardening

- Short-lived JWTs instead of the long-lived `SHARED_APP_TOKEN` — `route.ts` signs `{ exp: +60s }` with a `JWT_SECRET` from Vault, server middleware verifies; optional per-room scope.
- App-level: CORS allowlist via `ALLOWED_ORIGINS` env (currently `*`), payload size cap, last-message cache per room on subscribe.

### 7. Deprecated Nx executors/plugins not yet migrated (removed in Nx v24)

- `@nx/webpack:webpack` executor (`vb-express`, `llm-service`), plus `composePlugins`/`withNx` helpers — `nx g @nx/webpack:convert-to-inferred` refuses both because their `serve:no-vault` targets use `@nx/js:node`, which the codemod doesn't support alongside a webpack conversion. Needs either a later Nx version that lifts this restriction, or a careful manual conversion (see PR #93 for the pattern used on the 7 Next.js apps' build/serve targets).
- `@nx/angular/tailwind`, `@nx/next/tailwind`, `@nx/react/tailwind` glob-pattern helpers (14 `tailwind.config.js` files across the workspace) — deprecated in favor of Tailwind v4's CSS-first config, which no longer needs content globs. No automated codemod; workspace is currently on Tailwind v3.4.3 uniformly. Scoped out of PR #93 as a separate, larger migration.
- `nxViteTsPaths` / `nxCopyAssetsPlugin` from `@nx/vite/plugins/*` (5 Vite apps + 4 libs) — still deprecated even after the `@nx/vite:build` executor itself was migrated to the inferred plugin in PR #93. Replace with `vite-tsconfig-paths`'s `tsconfigPaths()` and Vite's native `publicDir` (or `vite-plugin-static-copy`), respectively.

### 8. Vite/Angular bundle-size warnings

- **`component-library`**: JS chunk 676.91 kB / CSS chunk 725.17 kB, both over the 500 kB threshold. CSS cause: `src/main.tsx` imports the full `@radix-ui/themes/styles.css` (812 kB unminified, unpurgeable). JS cause: `libs/@vigilant-broccoli/react-sandbox/src/lib/ComponentSandbox.tsx` statically imports all 13 demo components + 6 utility contents at module top-level, rendered unconditionally even though only one `CollapsibleList` section is open by default — fix with `React.lazy` + `Suspense` per demo.
- **`docs-md`**: JS chunk 520.30 kB / CSS chunk 733.63 kB, over threshold. Same `@radix-ui/themes/styles.css` full import in `src/main.tsx`, used only for the `<Theme>` wrapper — fix by dropping the Radix Themes dependency here in favor of a minimal custom CSS reset.
- **`journal`**: JS chunk 519.53 kB / CSS chunk 733.63 kB, over threshold. Same root cause and fix as `docs-md`. All three Vite apps additionally have no `build.rollupOptions.output.manualChunks` in `vite.config.mts` — everything (including `react`/`react-dom`/`@radix-ui/themes`) ships as one chunk; splitting vendor deps into their own chunk would help caching independent of the fixes above. (Tailwind content globs in all three are correctly scoped — confirmed not a contributing factor.)
- **`personal-website-frontend`** (Angular): initial bundle 536.44 kB, exceeds the configured 500 kB budget by 36.44 kB. Cause: `src/app/core/consts/routes.const.ts` declares all 9 routes with eager `component:`, so every page (including non-landing routes like `docs-md`, `grind-75`, `component-library`, `calendar`) bundles into the initial chunk. Fix: convert non-landing routes to `loadComponent: () => import(...).then(m => m.XPageComponent)`; lazy-loading even one or two clears the deficit. The budget itself (`apps/ui/personal-website-frontend/project.json:46-51`) doesn't need to change.

### 9. Next.js "inferred workspace root" warning

- Multiple Next.js apps (`small-business-next`, `vb-manager-next`, `vb-manager-next-mobile`, `whiteboard`, `findme`, `hearth`, `employee-handler-ui`) log "Next.js inferred your workspace root, but it may not be correct" — caused by the repo having two lockfiles (root `pnpm-lock.yaml` and `projects/nx-workspace/pnpm-lock.yaml`). Fix by setting `outputFileTracingRoot` (or `turbopack.root`) explicitly in each app's Next.js config, or removing the redundant lockfile. Deferred — CI builds pass today (warning only); revisit if a tracing-root-sensitive deploy issue surfaces, especially for `hearth` given its Vercel serverless `sharp` bundling.

### 10. `vb-manager-next`: Supabase Google sign-in has no allowlist — accepted risk (not fixed)

**`projects/nx-workspace/apps/ui/vb-manager-next/src/middleware.ts`**, `libs/server-auth.ts`

`middleware.ts` verifies the Supabase bearer token via `supabase.auth.getUser(token)` and admits any valid user — no allowed-emails check. **Any** Google user who completes the Supabase OAuth flow gets a valid session and passes the `/api/*` gate. The session is real access control, but any Google account can obtain one. (Migrated from NextAuth to Supabase auth; the missing-allowlist gap carried over unchanged. `employee-handler-ui`'s `proxy.ts` shows the allowlist pattern this could adopt.)

**Fix:** in `middleware.ts` (and `getUserEmail`), reject unless `data.user.email` is in an `ALLOWED_EMAILS` / `ALLOWED_EMAIL_DOMAINS` allowlist, mirroring `employee-handler-ui/src/proxy.ts`.

**Status:** deliberately left open. Owner's stated threat model: solo use, UI-only interaction, app bound to `127.0.0.1` (confirmed in `ecosystem.config.js` and the local nginx proxy), no external callers — the owner is the only account that will ever complete this app's Google OAuth flow, so the allowlist's marginal value is low here. Revisit if the app is ever exposed beyond loopback or a second Google account is ever expected to authenticate.

## P3

### 6. Framework surface

- The Angular 21 toolchain (~25 devDependencies) exists for one app, `cloud-8-skate-angular`. Migrating it to the React/Next stack removes the largest maintenance burden in the workspace.

### 11. Parallelize notify-start in ci-rotate-secrets

- `ci-rotate-secrets.yml` gates `rotate` on `needs: notify-start`, so the actual rotation waits for the notification job (checkout + Vault fetch + notify, ~30–60s) even though the notification is fire-and-forget (`continue-on-error: true`). Drop the `needs: notify-start` so both jobs start concurrently — matching `deploy.yml`, where `notify-start` already runs in parallel (its other jobs gate on `gitleaks` instead).
- Survey of all other `deploy-notify` consumers (so this doesn't need re-checking): `deploy.yml` is already parallel — nothing gates on its `notify-start`, and the `gitleaks` gate on the deploy jobs is a deliberate security gate, not a notification; `notify-complete.yml` is inherently sequential by design (`workflow_run`-triggered completion notification after deploy/ci-rotate-secrets finish). `ci-rotate-secrets.yml` is the only workflow with the blocking pattern, so this item is fully scoped to the one `needs:` line.

### `health-check.sh` is fully serial with retry sleeps

**`projects/nx-workspace/scripts/shell/health-check.sh`** — 10 endpoints checked one after another (each up to 3 attempts × `--max-time 30` + `sleep 5`), then gcloud, Vault, terraform+SSH, and an AMQP connect. A cold-start-heavy run takes minutes. **Fix:** run the `http_check`s as background jobs and `wait`; wall time drops from sum to max.
