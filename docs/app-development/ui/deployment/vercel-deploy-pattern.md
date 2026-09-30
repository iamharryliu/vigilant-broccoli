# Vercel deploy pattern (Next.js apps)

Deploys for `hearth`, `findme`, `whiteboard`, `employee-handler-ui`, `vb-manager-next-mobile`. Everything runs through `scripts/deploy-vercel.ts`.

## Table of Contents

- [Targets](#targets)
- [What the script does](#what-the-script-does)
- [The build runs on the runner, not on Vercel](#the-build-runs-on-the-runner-not-on-vercel)
- [Domains are explicit records, not derived from the project name](#domains-are-explicit-records-not-derived-from-the-project-name)
- [Gotchas](#gotchas)
- [New app checklist (Vercel-side)](#new-app-checklist-vercel-side)

## Targets

Each app defines a `deploy` (staging) / `deploy:production` pair that sets `VERCEL_PROJECT_ID=<env>-<app>` and `VERCEL_ORG_ID`, then runs `NODE_EXTRA_CA_CERTS=./scripts/vault-ca.crt node --import tsx scripts/deploy-vercel.ts <app> <env>` (copy `hearth`'s targets).

`VERCEL_PROJECT_ID` must be the project **name** (`staging-hearth`), never a `prj_` ID — `ensureProjectExists` creates the project by that name on first deploy, so a new (or renamed) app needs no manual console setup. Each repo environment is its own Vercel project.

## What the script does

1. Looks the app up in its `projectConfigs` map — **a new app must be added there** (`hardcodedSecrets`, optional `envExamplePath`, `settings`).
2. Syncs env vars via `vercel env rm` + `add`: `hardcodedSecrets` (the Supabase public pair for all apps; `hearth` also derives `NEXT_PUBLIC_APP_URL` / `VB_EXPRESS_URL` / `EMAIL_SERVICE_URL` from the environment so each env talks only to same-env fly siblings) plus the remaining keys of the app's `.env*.example` pulled from Vault. Vars always go into the Vercel `production` environment — the staging/production split lives in the project name, not Vercel's env tiers.
3. Ensures + patches project settings on every deploy: `framework: nextjs`, `rootDirectory: projects/nx-workspace`, `buildCommand: nx build <app>`, `installCommand: pnpm install --frozen-lockfile`, `outputDirectory: dist/.../.next`.
4. Runs `npx vercel build --prod --cwd <repo root> --output <out>` to build and package on the runner, then `npx vercel deploy --prebuilt --prod --cwd <out cwd>` to upload it.

`VERCEL_TOKEN` comes from the environment or is fetched from Vault.

## The build runs on the runner, not on Vercel

The Hobby plan builds **one deployment at a time**, so letting Vercel build every Next.js app serialised them into ~20 min of each full deploy — the single largest cost in `deploy.yml`. Building locally and uploading the result sidesteps that cap, because a `--prebuilt` deployment has nothing left to build.

Five constraints shape the wiring. Each one fails in a way that points nowhere near its cause:

- **The whole `.vercel` directory must be cleared before each build — this is the one that fails silently.** `vercel build` takes its settings from an existing `.vercel/project.json` in preference to `VERCEL_PROJECT_ID`, so a link left behind by the previous app makes it build **that app's project** instead. The upload still goes to the correct project, so every app ends up publishing the first app's code under its own name, with a green deploy and no error anywhere. Clearing only `.vercel/output` is not enough; the link and the pulled env file have to go too.
- **`vercel build` must run the build itself.** Handed a `.next` that some other command produced — say an nx `dependsOn: ["build"]` — it packages nothing and dies with `Cannot find module 'next/dist/compiled/next-server/server.runtime.prod.js'`, required from a fabricated `<repoRoot>/apps/<app>/noop.js`. That is why the project keeps its real `nx build <app>` buildCommand. Do not "optimise" it to a no-op.
- **Build-time env must be passed in the process environment.** `vercel build` does not fetch env from the API (that path is only reachable via `--id`); it loads `<cwd>/<rootDirectory>/.vercel/.env.<target>.local`. But `vercel pull` writes that file to `<cwd>/.vercel/` instead, so with a `rootDirectory` set it never loads — and the CLI only debug-logs the miss. Any app constructing a Supabase client at module scope then fails with `supabaseUrl is required`. The script passes `allSecrets` directly instead, which also keeps concurrent deploys off a shared file.
- **The upload must also run from the repo root.** A per-app cwd looks tempting for isolation, but the serverless functions reference their dependencies by repo-relative path (`projects/nx-workspace/node_modules/...`) and the upload resolves those against its cwd, so anywhere else it fails with `Please ensure project dependencies have been installed`. `--output` is therefore passed explicitly: `vercel build` defaults to `<cwd>/<rootDirectory>/.vercel/output` while the upload reads `<cwd>/.vercel/output`, and left alone the two never meet.
- **The build and its upload run together under one lock, one app at a time.** Because both must run from the repo root, every app shares a single `.vercel` directory, and `VERCEL_DIR` is a hardcoded constant in the CLI so there is nothing to redirect. Concurrently the last `vercel build` pull wins and apps read each other's project settings — which is how four apps ended up running `nx build whiteboard` and Nx aborted with `Recursive task invocation detected`. The lock spans the pair, not just the build, since the shared output directory is what the upload reads. Combined with clearing `.vercel` at the top of each turn, that also means a build which fails late cannot leave one app's output for the next app to upload. Note a local concurrency test proves little here: the window is timing-dependent and passes on fast disks.

## Domains are explicit records, not derived from the project name

Renaming a project does **not** move its `<name>.vercel.app` domain, and `vercel deploy` never adds or removes domains — it only points the project's existing domains at the new deployment. Attach/detach via the API (`POST`/`DELETE /v9/projects/{idOrName}/domains`, `VERCEL_TOKEN` from Vault). When renaming a deployed instance, add the new `<name>.vercel.app` domain and remove the old one explicitly.

## Gotchas

- `sharp` must remain in the workspace root `dependencies` — required for Vercel serverless bundling of the `hearth` `/api/where-is` route.
- Apps with Supabase sign-in need their real deployed domains in `uri_allow_list` — follow [supabase-auth-pattern.md](../auth/supabase-auth-pattern.md); a missing entry silently redirects to `site_url`.

## New app checklist (Vercel-side)

1. `deploy` / `deploy:production` target pair in `project.json`.
2. Entry in `projectConfigs` in `scripts/deploy-vercel.ts`.
