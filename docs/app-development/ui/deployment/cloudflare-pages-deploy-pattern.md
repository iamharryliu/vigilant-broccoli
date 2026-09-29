# Cloudflare Pages deploy pattern (static UI apps)

Static UIs in `apps/ui/*` deploy to Cloudflare Pages via wrangler.

## Table of Contents

- [The wrangler target trio (per environment)](#the-wrangler-target-trio-per-environment)
- [Branch matching: every deploy passes `--branch` explicitly](#branch-matching-every-deploy-passes---branch-explicitly)
- [Per-environment build config](#per-environment-build-config)
- [Custom domains (Terraform)](#custom-domains-terraform)
- [New app checklist (Cloudflare-side)](#new-app-checklist-cloudflare-side)

Reference apps:

- `cloud-8-skate-react` — full staging + production pair, plus sitemap generation before deploy.
- `personal-website-react` — React variant with the same staging + production pair.
- `docs-md` — full staging + production pair, no per-environment build config (`prune-deployments`'s `dependsOn` ordering is the reference for that part).

## The wrangler target trio (per environment)

- `ensure-cf-project` — `wrangler pages project list | grep -qw <project> || wrangler pages project create <project> --production-branch <branch>`. Auto-creation: the first deploy provisions the project, no console setup. `<branch>` is `main` for the staging project and `production` for the `:production` one — see the branch-matching rule below.
- `prune-deployments` — `scripts/prune-wrangler-deployments.ts <project> 10`: keeps the newest 10 deployments, deletes the rest (Pages accumulates one deployment per push otherwise). Give it its own `"dependsOn": ["ensure-cf-project"]` (`["ensure-cf-project:production"]` for the `:production` variant) rather than relying on `deploy`'s `dependsOn` list to order it — Nx doesn't serialize siblings listed there, so on a brand-new project `prune-deployments` can race ahead of `ensure-cf-project` and fail with "Project not found" the first time a project deploys. `docs-md` carries the correct form; copy it, not the `deploy` list's ordering.
- `deploy` — `wrangler pages deploy <dist dir> --project-name <project> --branch <branch>`, `dependsOn` the build and the two targets above.

Project names are environment-prefixed (`staging-docs-md`, `production-cloud-8-skate-react`); production mirrors the trio as `:production` target variants. Each app also carries a `manual-deploy` target (same command as `deploy`) — `manual-deploy-app.yml` dispatches whichever target name is chosen via `nx run-many -t $DEPLOY_TARGET`.

## Branch matching: every deploy passes `--branch` explicitly

Cloudflare files a deploy as a **Production** deployment only when its branch equals the project's `production_branch`; anything else becomes a **Preview**. Only Production deployments are served by the root `pages.dev` URL and by any attached custom domain. So the two settings must agree per environment, and they mirror the branches `deploy.yml` deploys from:

| Target              | Project        | `--production-branch` | `--branch`   |
| ------------------- | -------------- | --------------------- | ------------ |
| `deploy`            | `staging-*`    | `main`                | `main`       |
| `deploy:production` | `production-*` | `production`          | `production` |

Never leave `--branch` off and let wrangler infer it. It reads `GITHUB_REF_NAME`, which follows whichever trigger fired the run rather than the environment being deployed — `ci-rotate-secrets` calls `deploy.yml` with `environment: production` from a dispatch off `main`, and a `workflow_dispatch` with `environment: staging` can run from the `production` branch. Both mislabel the deploy and silently demote it to a Preview.

The failure is invisible: CI stays green, and the live URL keeps serving the last real Production deployment forever instead of the code that was just deployed — or shows "Nothing is here yet" if there has never been one. It went unnoticed until `cloud8skate.com` became the first custom domain on a `production-*` project; before that every domain pointed at a `staging-*` project, where the trigger branch and `production_branch` happened to agree.

**`ensure-cf-project` cannot repair an existing project.** It is a create-if-missing guard, so changing `--production-branch` in `project.json` only affects projects that don't exist yet. To change it on a live project, either delete the project and let the next deploy recreate it (which also drops any Terraform-managed `cloudflare_pages_domain` attachment — re-run `pnpm tf:apply` to restore it), or PATCH `production_branch` via the Cloudflare API.

## Per-environment build config

`deploy:production` builds with `--configuration=production-env` — a build configuration whose `fileReplacements` swap `environment.ts` → `environment.production.ts`, baking per-env fly URLs into the bundle at build time (static sites cannot read env vars at runtime).

## Custom domains (Terraform)

Terraform owns the `cloudflare_pages_domain` attachment and its DNS record — one `cloudflare-<site>.tf` per site in `infrastructure/terraform/`. `cloudflare-cloud8skate.tf` is the plain pattern. Private content is deliberately not served from Pages at all — it stays on the self-hosted Gitea VM behind Access, since a Pages deploy would copy it onto a CI runner and Cloudflare storage. Custom domains are environment-less: attached to whichever environment's project serves live traffic — `harryliu.dev` still points at its `staging-*` project, but `cloud8skate.com` is attached to `production-cloud-8-skate-react` (the first domain on a `production-*` project, which is what surfaced the branch-matching rule above) and `docs.harryliu.dev` now points at `production-docs-md`. Public URLs per domain: [network-management.md](../../../infrastructure/network-management.md).

## New app checklist (Cloudflare-side)

1. Wrangler target trio (staging, and `:production` variants unless deliberately single-env) + `manual-deploy` in `project.json` — copy `docs-md`, which has `prune-deployments`'s `dependsOn` ordering right (`personal-website-react` and `cloud-8-skate-react` were both missing it until it caused a first-deploy CI failure).
2. Matching `--production-branch`/`--branch` pair per environment (`main` for staging, `production` for `:production`) on every wrangler command.
3. `cloudflare-<site>.tf` if the site gets a custom domain.
