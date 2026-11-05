# Agent Context — pages-index

## Table of Contents

- [Nuances](#nuances)
  - [Pages on the status host must not use bare router links](#pages-on-the-status-host-must-not-use-bare-router-links)

- Page shells share one container width and gutter through `src/app/consts/layout.ts` (`PAGE_CLASS`, `FULL_HEIGHT_PAGE_CLASS`). A new page uses one of those rather than its own `max-w-*`/`px-*` combination, so the content column does not shift between routes.
- When adding, removing, or changing a route, card link, or external destination, update [page-navigation.md](./docs/features/page-navigation.md) so it stays in sync with `src/app/app.tsx`, `src/app/consts/breadcrumbs.ts`, and the home-page cards.
- Web application and demo cards are defined in `src/app/consts/webApplications.json` (data only; icons stay in `WebApplicationsPage.tsx`, keyed by each entry's `id`). `scripts/node/repo-stats.mjs` counts its distinct `href`s for the generated "applications" figure, so edit the registry for any card change and run `pnpm repo-stats`.

## Nuances

### Pages on the status host must not use bare router links

`projects.harryliu.dev` (GitHub Pages), `status.harryliu.dev`, `career.harryliu.dev` and `deployments.harryliu.dev` (Cloudflare Worker `status-proxy` in `infrastructure/cloudflare-workers/status-proxy/`, reverse-proxying the former) serve one build. The career host has its own route table (`CareerHostRoutes`); its pages link to other hosts with plain external URLs and the `Breadcrumb` root label shows "Career" there. The deployments host has its own table too (`DeploymentsHostRoutes`) and, like the status host, its breadcrumb ancestors are `toProjectsUrl` links. Anything on `StatusPage` or `DeploymentsPage` that points at another pages-index page must go through `toProjectsUrl` / the host-aware `Breadcrumb`, never a bare router `Link` — on the status host a hash link would stay on that host and land on a redirect. Keep `route` on `PageHeader` for pages that render outside their own route.
