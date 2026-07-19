# Vercel deploy pattern (Next.js apps)

Deploys for `hearth`, `findme`, `whiteboard`, `employee-handler-ui`. Everything runs through `scripts/deploy-vercel.ts`; app-side requirements (i18n, cards) are in [ui-app-pattern.md](../ui-app-pattern.md).

## Targets

Each app defines a `deploy` (staging) / `deploy:production` pair that sets `VERCEL_PROJECT_ID=<env>-<app>` and `VERCEL_ORG_ID`, then runs `NODE_EXTRA_CA_CERTS=./scripts/vault-ca.crt node --import tsx scripts/deploy-vercel.ts <app> <env>` (copy `hearth`'s targets).

`VERCEL_PROJECT_ID` must be the project **name** (`staging-hearth`), never a `prj_` ID — `ensureProjectExists` creates the project by that name on first deploy, so a new (or renamed) app needs no manual console setup. Each repo environment is its own Vercel project.

## What the script does

1. Looks the app up in its `projectConfigs` map — **a new app must be added there** (`hardcodedSecrets`, optional `envExamplePath`, `settings`).
2. Syncs env vars via `vercel env rm` + `add`: `hardcodedSecrets` (the Supabase public pair for all apps; `hearth` also derives `NEXT_PUBLIC_APP_URL` / `VB_EXPRESS_URL` / `EMAIL_SERVICE_URL` from the environment so each env talks only to same-env fly siblings) plus the remaining keys of the app's `.env*.example` pulled from Vault. Vars always go into the Vercel `production` environment — the staging/production split lives in the project name, not Vercel's env tiers.
3. Ensures + patches project settings on every deploy: `framework: nextjs`, `rootDirectory: projects/nx-workspace`, `buildCommand: nx build <app>`, `installCommand: pnpm install --frozen-lockfile`, `outputDirectory: dist/.../.next`.
4. Runs `npx vercel deploy --prod --yes <repo root>` — Vercel builds the app itself.

`VERCEL_TOKEN` comes from the environment or is fetched from Vault.

## Domains are explicit records, not derived from the project name

Renaming a project does **not** move its `<name>.vercel.app` domain, and `vercel deploy` never adds or removes domains — it only points the project's existing domains at the new deployment. Attach/detach via the API (`POST`/`DELETE /v9/projects/{idOrName}/domains`, `VERCEL_TOKEN` from Vault). When renaming a deployed instance, add the new `<name>.vercel.app` domain and remove the old one explicitly.

## Gotchas

- `sharp` must remain in the workspace root `dependencies` — required for Vercel serverless bundling of the `hearth` `/api/where-is` route (CLAUDE.md).
- Apps with Supabase sign-in need their real deployed domains in `uri_allow_list` — follow [supabase-auth-pattern.md](../../auth/supabase-auth-pattern.md); a missing entry silently redirects to `site_url`.

## New app checklist

1. `deploy` / `deploy:production` target pair in `project.json`.
2. Entry in `projectConfigs` in `scripts/deploy-vercel.ts`.
3. The rest of the deployable-app checklist (Upptime, `manual-deploy-app.yml`, test coverage) is in [repo-patterns.md](../../../../../docs/repo-patterns.md).
