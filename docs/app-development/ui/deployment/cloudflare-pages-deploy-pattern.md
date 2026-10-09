# Cloudflare Pages deploy pattern (static UI apps)

Static UIs in `apps/ui/*` deploy to Cloudflare Pages via wrangler.

## Table of Contents

- [The wrangler target trio (per environment)](#the-wrangler-target-trio-per-environment)
- [Branch matching: every deploy passes `--branch` explicitly](#branch-matching-every-deploy-passes---branch-explicitly)
- [PR previews](#pr-previews)
- [Per-environment build config](#per-environment-build-config)
- [Sources outside the nx graph need their own trigger](#sources-outside-the-nx-graph-need-their-own-trigger)
- [Custom domains (Terraform)](#custom-domains-terraform)
- [New app checklist (Cloudflare-side)](#new-app-checklist-cloudflare-side)

Reference apps:

- `cloud-8-skate-react` — full staging + production pair, plus sitemap generation before deploy.
- `personal-website-react` — React variant with the same staging + production pair.
- `utilities-ui` — full staging + production + preview set, no per-environment build config.
- `context-md` — copy of `docs-md` over the agent-context snapshot.
- `calendars` — staging + production pair, no preview trio, with a live API base URL swapped per environment (`mode` alias in `vite.config.mts`).
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

## PR previews

`personal-website-react`, `pages-index`, `docs-md`, `links-react`, `utilities-ui` and `component-library` also carry a preview trio against a dedicated `preview-<site>` project, kept separate so the staging prune can't delete a PR's live preview:

- `ensure-cf-project:preview` — same auto-create as above.
- `deploy:preview` — `wrangler pages deploy <dist dir> --project-name preview-<site> --branch "$PREVIEW_BRANCH" --commit-hash "$PREVIEW_COMMIT"`. `PREVIEW_BRANCH` is `pr-<n>`, not a git branch, so Pages serves the PR at the alias `pr-<n>.preview-<site>.pages.dev`. It never equals the project's `production_branch`, which is what keeps every preview a Preview deployment per the rule above. `--commit-hash` is what ties a deployment back to a commit in the Cloudflare dashboard — the alias deliberately carries no commit, so that it stays stable as the PR is pushed to.
- `prune-deployments:preview` — `scripts/prune-wrangler-preview-deployments.ts preview-<site>`: keeps only the newest deployment of each **open** PR (`gh pr list --state open`, so it needs `GH_TOKEN`) and deletes the rest. It carries its own `dependsOn` for the same first-deploy race reason as the staging trio.

**The alias is keyed on the PR, not the branch, for two reasons.** Cloudflare sanitises a branch name into the alias host and truncates it to 28 characters, so `agent/task-implement-preview-branches-for-stateless-1790107341` collapsed to `agent-task-implement-preview` — two branches agreeing on the first 28 sanitised characters would silently share one alias. `pr-<n>` is short, unique, and readable. It also gives the prune a liveness signal that matches what a preview is for: a PR being closed, rather than a branch eventually being deleted.

`deploy-preview.yml` runs `deploy:preview` for the affected projects on every pull request (plus `pages-index`/`docs-md` when their out-of-workspace snapshot sources change), writes a table of the alias and per-deployment URLs to the job summary, then prunes. It is `pull_request`-triggered because a `push` event carries no PR number. `cron-cleanup-preview-deployments.yml` runs the prune for every project daily, collecting the previews of PRs that have since closed. Previews build with `--skip-nx-cache`: `VITE_BASE_PATH` isn't a build input, so a cached `/vigilant-broccoli/`-based Pages build could otherwise be served. Both workflows pass `--output-style=static`, since nx hides successful tasks' output and that output is the only record of the URLs deployed and the deployments deleted.

A new stateless site opts in by adding the trio — the workflows discover it via `nx show projects --withTarget=deploy:preview`. Only stateless sites belong here: a preview of an app with a backend would still talk to staging services. `calendars` deliberately has no preview trio for that reason: it fetches live data from VB Express.

## Per-environment build config

`deploy:production` builds with `--configuration=production-env`, baking per-env fly URLs into the bundle at build time (static sites cannot read env vars at runtime). `environment.ts` → `environment.production.ts` cannot be a `fileReplacements` swap because the inferred Vite build ignores `fileReplacements` (see the [nx-workspace nuance](../../../../projects/nx-workspace/CONTEXT.md#filereplacements-in-a-vite-apps-projectjson-is-ignored)); `calendars`, `cloud-8-skate-react` and `personal-website-react` set the `production-env` configuration's `mode` to `production-env` and alias the environment module in `vite.config.mts` instead.

## Sources outside the nx graph need their own trigger

`deploy.yml` picks what to deploy with `nx show projects --affected`, so an app whose content comes from outside the nx graph is invisible to it. `docs-md` and `context-md` are the two such apps: their `build-snapshot` targets read `snapshot.config.json`, rooted at the repo's `notes/` tree (`docs-md`) or at `CONTEXT.md`, `TODO.md`, `docs/**`, `setup/dotfiles/agent-skills/**` and every `CONTEXT.md` (`context-md`). `deploy-docs-md.yml` and `deploy-context-md.yml` exist to cover that gap, and because it owns the trigger it must also mirror `deploy.yml`'s environment selection — ref `production` (or a dispatch choosing it) runs the `deploy:production` target, anything else runs `deploy`. It invokes them through `run-many -t`, since `nx run docs-md:deploy:production` would read that trailing colon as a configuration on target `deploy`. Keeping it staging-only is what silently stopped `notes/` changes from reaching `docs.harryliu.dev` once that domain moved to `production-docs-md`: pushes still deployed, just to the project no domain pointed at. If another app grows an out-of-graph content source, give it the same paired trigger rather than widening `deploy.yml`'s paths — a path there fires the whole deploy pipeline, which then finds nothing affected and burns a run per push. The accepted cost of the split is that a push to `production` touching both `notes/**` and `projects/nx-workspace/**` deploys `production-docs-md` twice — once from each workflow, since a production `deploy.yml` run does an unfiltered `run-many -t deploy:production`. The deploys are idempotent and promotions are infrequent, so this is left alone rather than solved by sharing a concurrency group: group names are repo-wide, and `deploy.yml`'s staging half sets `cancel-in-progress: true`, which would let a staging deploy cancel an in-flight notes publish.

## Custom domains (Terraform)

Terraform owns the `cloudflare_pages_domain` attachment and its DNS record — one `cloudflare-<site>.tf` per site in `infrastructure/terraform/`. `cloudflare-cloud8skate.tf` is the plain pattern. Private content is deliberately not served from Pages at all — it stays on the self-hosted Gitea VM behind Access, since a Pages deploy would copy it onto a CI runner and Cloudflare storage. Custom domains are environment-less: attached to whichever environment's project serves live traffic — `harryliu.dev` points at `production-harryliu-dev-react`, `cloud8skate.com` is attached to `production-cloud-8-skate-react` (the first domain on a `production-*` project, which is what surfaced the branch-matching rule above), and `docs.harryliu.dev` now points at `production-docs-md`, `context.harryliu.dev` at `production-context-md`, `links.harryliu.dev` at `production-links-react`, `utilities.harryliu.dev` at `production-utilities-ui`, and `components.harryliu.dev` at `production-component-library`, and `calendars.harryliu.dev` at `production-calendars`. Public URLs per domain: [network-management.md](../../../infrastructure/network-management.md).

## New app checklist (Cloudflare-side)

1. Wrangler target trio (staging, and `:production` variants unless deliberately single-env) + `manual-deploy` in `project.json` — copy `docs-md`, which has `prune-deployments`'s `dependsOn` ordering right (`personal-website-react` and `cloud-8-skate-react` were both missing it until it caused a first-deploy CI failure).
2. Matching `--production-branch`/`--branch` pair per environment (`main` for staging, `production` for `:production`) on every wrangler command.
3. `cloudflare-<site>.tf` if the site gets a custom domain.
4. The `:preview` trio if the site is stateless and should get PR previews.
