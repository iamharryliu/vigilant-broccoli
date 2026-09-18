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

## Per-environment build config

`deploy:production` builds with `--configuration=production-env` — a build configuration whose `fileReplacements` swap `environment.ts` → `environment.production.ts`, baking per-env fly URLs into the bundle at build time (static sites cannot read env vars at runtime).

## Custom domains (Terraform)

Terraform owns the `cloudflare_pages_domain` attachment and its DNS record — one `cloudflare-<site>.tf` per site in `infrastructure/terraform/`. `cloudflare-cloud8skate.tf` is the plain pattern. Private content is deliberately not served from Pages at all — it stays on the self-hosted Gitea VM behind Access, since a Pages deploy would copy it onto a CI runner and Cloudflare storage. Custom domains are environment-less: attached to whichever environment's project serves live traffic (today the `staging-*` projects). Public URLs per domain: [network-management.md](../../infrastructure/network-management.md).

## New app checklist (Cloudflare-side)

1. Wrangler target trio (staging, and `:production` variants unless deliberately single-env) + `manual-deploy` in `project.json` — copy `personal-website-react`.
2. `cloudflare-<site>.tf` if the site gets a custom domain.
