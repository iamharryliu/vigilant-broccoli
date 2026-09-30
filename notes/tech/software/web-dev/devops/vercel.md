# Vercel

## Table of Contents

- [Free Tier](#free-tier)
- [Prebuilt deploys](#prebuilt-deploys)
  - [What does not work](#what-does-not-work)
- [References](#references)

## Free Tier

Hobby plan — free, but restricted to non-commercial personal use (any deployment tied to financial gain for anyone involved requires Pro/Enterprise). Limits reset monthly; hitting one pauses the project rather than billing overage, and in most cases you wait ~30 days before the feature works again.

- **Concurrent deployments: 1** — builds beyond that run sequentially, FIFO. Documented under build concurrency rather than on the plan page, so it is easy to miss: deploying N projects from one CI job costs the sum of their build times, not the longest. Pro allows up to 500 with on-demand concurrency (3 with it off), billed per build minute.
- Fast Data Transfer (bandwidth): up to 100 GB/mo.
- Fast Origin Transfer: up to 10 GB/mo.
- Edge Requests: up to 1,000,000/mo.
- Function Invocations: up to 1,000,000/mo.
- Active CPU: up to 4 CPU-hrs/mo.
- Provisioned Memory: up to 360 GB-hrs/mo.
- Function max duration: 300s (5 min).
- Build machine: always Basic on Hobby — 2 vCPUs, 8GB memory, 32GB disk. Larger machines (Standard/Enhanced/Turbo/Elastic) are paid-plan only.
- Build step max duration: 45 min.
- Projects: up to 200. Domains per project: up to 50. Deployments per day: up to 100.
- Runtime logs retained: 1 hour.
- Image transformations: 5,000/mo; image cache reads 300K/mo; image cache writes 100K/mo.

Pro is $20/developer-seat/month with usage-based overage on most of the above instead of a hard pause.

## Prebuilt deploys

Because a Hobby team gets one concurrent deployment, deploying several projects from one CI job serialises on Vercel's build queue. Building in CI and uploading the result avoids that entirely — `vercel build` produces a [Build Output API](https://vercel.com/docs/build-output-api/v3) directory and `vercel deploy --prebuilt` uploads it, so there is no build left for the queue to gate. The Vercel-side duration per deployment drops to a few seconds.

The pieces are `vercel build --prod --output <dir>` followed by `vercel deploy --prebuilt --prod`, both run from the directory the project is linked against, with `VERCEL_PROJECT_ID`/`VERCEL_ORG_ID` in the environment to select the project.

### What does not work

These all fail with errors that point nowhere near their cause, which makes them expensive to rediscover. The first one is the dangerous one, because it does not fail at all:

- **Reusing a working directory between projects without deleting `.vercel` first — this one is silent.** `vercel build` takes its settings from an existing `.vercel/project.json` in preference to `VERCEL_PROJECT_ID`, so a link left behind by a previous project makes it build **that** project. The upload still goes to the project named in the environment, so each one publishes the first project's code under its own name, with a successful deploy and no error anywhere. Deleting only `.vercel/output` is not enough; the link has to go too. Verify a multi-project deploy by fetching each site and comparing content — deployment metadata will look correct, because the deployment really does belong to the right project.
- **Handing `vercel build` a framework output some other command produced.** It has to run the build itself; a no-op `buildCommand` plus a pre-existing `.next` does not work. It packages nothing and dies on `Cannot find module 'next/dist/compiled/next-server/server.runtime.prod.js'`, required from a `noop.js` path the builder fabricates.
- **Building an app that uses the framework's standalone output from a task-runner cache.** Next's `output: 'standalone'` writes its server into `.next/standalone` as a tree of symlinks into the package store. A cache (Nx, Turborepo) will happily store and restore that, but the restored tree is not packageable and produces the same fabricated-`noop.js` failure as above — only a real build works, so those projects need their cache skipped. Apps on the framework's default output restore from cache and package fine, so this is worth scoping rather than disabling caching everywhere.
- **Expecting `vercel build` to fetch environment variables from the API.** That path is only reachable via `--id <deployment>`. Otherwise it reads `<cwd>/<rootDirectory>/.vercel/.env.<target>.local` — but `vercel pull` writes that file to `<cwd>/.vercel/`, so when the project has a **Root Directory** set the two never meet and nothing loads. The miss is only debug-logged, so the first visible symptom is the app's own build failing on a missing value (e.g. a client constructed at module scope throwing `supabaseUrl is required`). Pass build-time variables in the process environment instead.
- **Expecting `vercel pull` to return variables marked Sensitive.** They come back present but **empty**, so no file-based approach can carry them regardless of the path mismatch above.
- **Pointing `vercel deploy --prebuilt` at an arbitrary directory.** There is no `--output` flag on `deploy`. It reads `<cwd>/.vercel/output`, and only prepends the project's Root Directory when the link carries a repo root (a repo-link, i.e. `.vercel/repo.json`) — a plain project link via environment variables does not. It also requires the Root Directory path to _exist_ under the cwd, even though the upload never reads anything but the output.
- **Running the upload outside the tree the build referenced.** Functions reference their dependencies by paths relative to the project root, and the upload resolves them against its cwd, so it fails with `Please ensure project dependencies have been installed: File does not exist: <path>`. The upload has to run where those paths resolve, which means build and upload share one working directory.
- **Running two CLI invocations concurrently in one directory.** `.vercel/` is a single hardcoded location, so concurrent `vercel build` runs overwrite each other's pulled project settings and the loser builds with another project's `buildCommand`. Serialise them; a local test is not evidence, because the window is timing-dependent and usually passes on fast disks.

One security note: `vercel build` and `vercel pull` leave `.vercel/.env.<target>.local` in the working directory containing a live `VERCEL_OIDC_TOKEN`. Gitignore `.vercel/` at every directory the CLI is invoked from, not just the project subdirectory.

## References

- [Vercel Hobby Plan](https://vercel.com/docs/plans/hobby)
- [Managing Builds](https://vercel.com/docs/builds/managing-builds) — build machines and the per-plan concurrency limits
- [Build Output API](https://vercel.com/docs/build-output-api/v3) — the format `vercel build` emits and `--prebuilt` uploads
- [Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines)
- [vercel-deploy-pattern.md](../../../../../docs/app-development/ui/deployment/vercel-deploy-pattern.md) — how this repo deploys Next.js apps to Vercel
