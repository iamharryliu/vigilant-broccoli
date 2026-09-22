# Cloudflare Pages deploy pattern (static UI apps)

Static UIs in `apps/ui/*` deploy to Cloudflare Pages via wrangler.

Reference apps:

- `cloud-8-skate-angular` — full staging + production pair, plus sitemap generation before deploy.
- `personal-website-react` — React variant with the same staging + production pair.
- `docs-md` — staging-only.

## The wrangler target trio (per environment)

- `ensure-cf-project` — `wrangler pages project list | grep -qw <project> || wrangler pages project create <project> --production-branch main`. Auto-creation: the first deploy provisions the project, no console setup.
- `prune-deployments` — `scripts/prune-wrangler-deployments.ts <project> 10`: keeps the newest 10 deployments, deletes the rest (Pages accumulates one deployment per push otherwise).
- `deploy` — `wrangler pages deploy <dist dir> --project-name <project>`, `dependsOn` the build and the two targets above.

Project names are environment-prefixed (`staging-docs-md`, `production-cloud-8-skate-angular`); production mirrors the trio as `:production` target variants. Each app also carries a `manual-deploy` target (same command as `deploy`) — `manual-deploy-app.yml` dispatches whichever target name is chosen via `nx run-many -t $DEPLOY_TARGET`.

## Branch previews

`personal-website-react`, `pages-index`, and `docs-md` also carry a preview trio against a dedicated `preview-<site>` project, kept separate so the staging prune can't delete a branch's live preview:

- `ensure-cf-project:preview` — same auto-create as above.
- `deploy:preview` — `wrangler pages deploy <dist dir> --project-name preview-<site> --branch "$PREVIEW_BRANCH"`, so Pages serves it at the branch alias `<branch>.preview-<site>.pages.dev`.
- `prune-deployments:preview` — `scripts/prune-wrangler-preview-deployments.ts preview-<site>`: keeps only the newest deployment of each branch that still exists on `origin` (`git ls-remote --heads`) and deletes the rest.

`deploy-preview.yml` runs `deploy:preview` for the affected projects on every push to a non-`main`/`production` branch (plus `pages-index`/`docs-md` when their out-of-workspace snapshot sources change), writes the alias URLs to the job summary, then prunes. It triggers on `push`, not `pull_request`, because the shared WIF provider rejects `pull_request` events. `cron-cleanup-preview-deployments.yml` runs the prune for every project on a branch `delete` event and daily, so a removed branch's preview goes away even if the delete event was missed. Previews build with `--skip-nx-cache`: `VITE_BASE_PATH` isn't a build input, so a cached `/vigilant-broccoli/`-based Pages build could otherwise be served. `pages-index` links to other GitHub Pages sub-paths (`/vigilant-broccoli/react-component-library/`) don't resolve on its preview.

A new stateless site opts in by adding the trio — the workflows discover it via `nx show projects --withTarget=deploy:preview`. Only stateless sites belong here: a preview of an app with a backend would still talk to staging services.

## Per-environment build config

`deploy:production` builds with `--configuration=production-env` — a build configuration whose `fileReplacements` swap `environment.ts` → `environment.production.ts`, baking per-env fly URLs into the bundle at build time (static sites cannot read env vars at runtime).

## Custom domains (Terraform)

Terraform owns the `cloudflare_pages_domain` attachment and its DNS record — one `cloudflare-<site>.tf` per site in `infrastructure/terraform/`. `cloudflare-cloud8skate.tf` is the plain pattern. Private content is deliberately not served from Pages at all — it stays on the self-hosted Gitea VM behind Access, since a Pages deploy would copy it onto a CI runner and Cloudflare storage. Custom domains are environment-less: attached to whichever environment's project serves live traffic (today the `staging-*` projects). Public URLs per domain: [network-management.md](../../infrastructure/network-management.md).

## New app checklist (Cloudflare-side)

1. Wrangler target trio (staging, and `:production` variants unless deliberately single-env) + `manual-deploy` in `project.json` — copy `personal-website-react`.
2. `cloudflare-<site>.tf` if the site gets a custom domain.
3. The `:preview` trio if the site is stateless and should get branch previews.
