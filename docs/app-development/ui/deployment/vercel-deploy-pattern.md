# Vercel deploy pattern (Next.js apps)

Deploys for `hearth`, `findme`, `whiteboard`, `employee-handler-ui`, `vb-manager-next-mobile`. Everything runs through `scripts/deploy-vercel.ts`.

## Table of Contents

- [Targets](#targets)
- [What the script does](#what-the-script-does)
- [The build runs locally, not on Vercel](#the-build-runs-locally-not-on-vercel)
- [Domains are explicit records, not derived from the project name](#domains-are-explicit-records-not-derived-from-the-project-name)
- [Gotchas](#gotchas)
- [New app checklist (Vercel-side)](#new-app-checklist-vercel-side)

## Targets

Each app defines a `deploy` (staging) / `deploy:production` pair that sets `VERCEL_PROJECT_ID=<env>-<app>` and `VERCEL_ORG_ID`, then runs `NODE_EXTRA_CA_CERTS=./scripts/vault-ca.crt node --import tsx scripts/deploy-vercel.ts <app> <env>` (copy `hearth`'s targets).

Both carry `"dependsOn": ["build"]` — nx builds the app, and the deploy only packages and uploads it (see [The build runs locally, not on Vercel](#the-build-runs-locally-not-on-vercel)). `employee-handler-ui` is the exception: its `deploy` depends on `deploy-container`, which already depends on `build`.

`VERCEL_PROJECT_ID` must be the project **name** (`staging-hearth`), never a `prj_` ID — `ensureProjectExists` creates the project by that name on first deploy, so a new (or renamed) app needs no manual console setup. Each repo environment is its own Vercel project.

## What the script does

1. Looks the app up in its `projectConfigs` map — **a new app must be added there** (`hardcodedSecrets`, optional `envExamplePath`, `settings`).
2. Syncs env vars via `vercel env rm` + `add`: `hardcodedSecrets` (the Supabase public pair for all apps; `hearth` also derives `NEXT_PUBLIC_APP_URL` / `VB_EXPRESS_URL` / `EMAIL_SERVICE_URL` from the environment so each env talks only to same-env fly siblings) plus the remaining keys of the app's `.env*.example` pulled from Vault. Vars always go into the Vercel `production` environment — the staging/production split lives in the project name, not Vercel's env tiers.
3. Ensures + patches project settings on every deploy: `framework: nextjs`, `rootDirectory: projects/nx-workspace`, `outputDirectory: dist/.../.next`, and **no-op `buildCommand` / `installCommand`** (both `echo` — see below).
4. Runs `npx vercel build --prod --cwd <repo root> --output <out>` to package the `.next` nx already built, then `npx vercel deploy --prebuilt --prod --cwd <out cwd>` to upload it.

`VERCEL_TOKEN` comes from the environment or is fetched from Vault.

## The build runs locally, not on Vercel

The Hobby plan builds **one deployment at a time**, so letting Vercel build all five apps serialised them into ~20 min of every full deploy — the single largest cost in `deploy.yml`. Instead nx builds each app (parallel, remote-cached, via `dependsOn: ["build"]`) and `vercel build` only converts that output into the Build Output API format, so Vercel just receives an upload.

Four constraints shape the wiring. Getting any of them wrong fails in a confusing way:

- **`buildCommand` must not invoke nx.** It runs inside the `nx run-many -t deploy` that launched the deploy target, so `nx build <app>` there is a nested invocation of a task already in the chain, and nx 23 aborts with `Recursive task invocation detected`. The no-op `echo` is what keeps the build out of that chain.
- **`installCommand` is a no-op** because the runner already installed the workspace once in `setup-nx-workspace`, and concurrent `pnpm install --frozen-lockfile` runs would race on one `node_modules`.
- **`vercel deploy --prebuilt` has no `--output` flag.** It always reads `<cwd>/<rootDirectory>/.vercel/output`, so isolation between concurrently deploying apps comes from `--cwd`: each app packages into `dist/vercel/<app>/`, and `vercel build --output` is given `<that dir>/projects/nx-workspace/.vercel/output` so the two agree.
- **`vercel build` does not fetch env vars from the API.** It loads them from `<cwd>/<rootDirectory>/.vercel/.env.<target>.local`, a file only `vercel pull` writes, and merely debug-logs when it is missing. That silence is why an earlier attempt to have it run the real build failed with `supabaseUrl is required` rather than anything pointing at env. Nothing here depends on it, because the no-op `buildCommand` means no app code is evaluated during `vercel build`.

## Domains are explicit records, not derived from the project name

Renaming a project does **not** move its `<name>.vercel.app` domain, and `vercel deploy` never adds or removes domains — it only points the project's existing domains at the new deployment. Attach/detach via the API (`POST`/`DELETE /v9/projects/{idOrName}/domains`, `VERCEL_TOKEN` from Vault). When renaming a deployed instance, add the new `<name>.vercel.app` domain and remove the old one explicitly.

## Gotchas

- `sharp` must remain in the workspace root `dependencies` — required for Vercel serverless bundling of the `hearth` `/api/where-is` route.
- Apps with Supabase sign-in need their real deployed domains in `uri_allow_list` — follow [supabase-auth-pattern.md](../auth/supabase-auth-pattern.md); a missing entry silently redirects to `site_url`.

## New app checklist (Vercel-side)

1. `deploy` / `deploy:production` target pair in `project.json`.
2. Entry in `projectConfigs` in `scripts/deploy-vercel.ts`.
