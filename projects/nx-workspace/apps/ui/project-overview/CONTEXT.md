# Agent Context — project-overview

## Table of Contents

- [Nuances](#nuances)
  - [Pages on the status host must not use bare router links](#pages-on-the-status-host-must-not-use-bare-router-links)

- Page shells share one container width and gutter through `src/app/consts/layout.ts` (`PAGE_CLASS`, `FULL_HEIGHT_PAGE_CLASS`). A new page uses one of those rather than its own `max-w-*`/`px-*` combination, so the content column does not shift between routes.
- When adding, removing, or changing a route, card link, or external destination, update [page-navigation.md](./docs/features/page-navigation.md) so it stays in sync with `src/app/app.tsx`, `src/app/consts/breadcrumbs.ts`, and the home-page cards.
- Web application and demo cards are defined in `src/app/consts/webApplications.json` (data only; icons stay in `WebApplicationsPage.tsx`, keyed by each entry's `id`). `scripts/node/repo-stats.mjs` counts its distinct `href`s for the generated "applications" figure, so edit the registry for any card change and run `pnpm repo-stats`.
- Environments: `deploy` publishes `staging-project-overview` (Access-gated at `staging-projects.vigilant-broccoli.app`) from `main`, and `deploy:production` publishes `production-project-overview` from the `production` branch, which has no custom domain yet. The production hostnames keep serving the GitHub Pages build (`deploy-github-pages`, from `main`) and the `status-proxy` Worker until they are attached to `production-project-overview`. Every deploy path must ship freshly generated `repo-timeline.json` and `project-graph.json` (`stage-cloudflare-pages`, `deploy-github-pages`), since a cache-hit `build` carries stale copies.

## Nuances

### Pages on the status host must not use bare router links

`projects.vigilant-broccoli.app` (GitHub Pages), `status.vigilant-broccoli.app`, `career.harryliu.dev` and `deployments.vigilant-broccoli.app` (Cloudflare Worker `status-proxy` in `infrastructure/cloudflare-workers/status-proxy/`, reverse-proxying the former) serve one build. The career host has its own route table (`CareerHostRoutes`); its pages link to other hosts with plain external URLs and the `Breadcrumb` root label shows "Career" there. The deployments host has its own table too (`DeploymentsHostRoutes`) and, like the status host, its breadcrumb ancestors are `toProjectsUrl` links. Anything on `StatusPage` or `DeploymentsPage` that points at another project-overview page must go through `toProjectsUrl` / the host-aware `Breadcrumb`, never a bare router `Link` — on the status host a path link would stay on that host and land on a redirect. Keep `route` on `PageHeader` for pages that render outside their own route.
