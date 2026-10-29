# Page navigation

Non-obvious routing and data-source details for pages-index. Routes live in `src/app/app.tsx`, breadcrumbs in `src/app/consts/breadcrumbs.ts` and the app and demo detail pages in `src/app/consts/webApplications.json`; keep this doc in sync when those change.

## Table of Contents

- [Hosts](#hosts)
- [Deployments, status and repo timeline](#deployments-status-and-repo-timeline)
- [Open source](#open-source)
- [Web applications and API services](#web-applications-and-api-services)

## Hosts

- `status.harryliu.dev` — the same `StatusPage` at the host root. `app.tsx` picks the status route table when `window.location.hostname` is `STATUS_HOST` (`src/app/consts/hosts.ts`); other hash routes redirect to `/`. The Home breadcrumb and any other pages-index link there are explicit `https://projects.harryliu.dev/#/…` URLs, built with `toProjectsUrl`.
- `deployments.harryliu.dev` — `DeploymentsPage` at the host root. `app.tsx` picks the deployments route table when the hostname is `DEPLOYMENTS_HOST`; other hash routes redirect to `/`, and the Home breadcrumb is a `toProjectsUrl` link. Details: [deployments-page.md](./deployments-page.md).
- `career.harryliu.dev` — `CareerPage` at the host root (cards: Resume → `harryliu.dev/resume`, Personal Software Career Experience, `projects.harryliu.dev`, `harryliu.dev`, GitHub, LinkedIn). `app.tsx` picks the career route table when the hostname is `CAREER_HOST`; other hash routes redirect to `/`.
  - `/personal-software-career-experience` — renders `notes/personal/career/personal-software-career-experience.md` from `raw.githubusercontent.com`; its breadcrumb returns to the career root.

## Deployments, status and repo timeline

- `/status` — service health grouped by Production / Staging / Demo / Personal Apps from `iamharryliu/uptime`; unavailable monitoring data displays an error. Each service row shows 24h/7d/30d/1y uptime, a 30-day downtime strip and the response time from `summary.json`. A "Full uptime history" card links to `uptime.harryliu.dev` (the Upptime site), and GitHub Actions badges for both repositories follow the list.
- `/deployments` — open PRs with a deployed Cloudflare Pages preview (also the root of `deployments.harryliu.dev`), linked from the home page's Monitoring section; see [deployments-page.md](./deployments-page.md).
- `/repo-timeline` — lines of code, commits, PRs merged, lines added/deleted per day / month / year, shown as a horizontally scrollable bar chart or as react-lib's `ScrollTimeline`. Data is `public/repo-timeline.json`, generated from `git log --numstat` by the `generate-repo-timeline` target (`scripts/generate-repo-timeline.ts`, lockfiles and >100K-line single-file changes excluded) and copied into `_site` on each Pages deploy.

## Open source

The home page's Software Projects section links straight to GitHub, Docker Hub and npm; these lists live at `/github`, `/docker` and `/npm`, and each breadcrumb returns home. Legacy `/open-source/*` links redirect with the prefix stripped (`/open-source` itself to `/`).

- `/github` — all public `iamharryliu` repositories, fetched from the paginated GitHub API. `/github/:repo` fetches the README through the GitHub API from the default branch, with a link to the repository; loading, empty and fetch errors are displayed.
- `/docker` renders one card per entry in `src/app/consts/dockerImages.json`, titled by the image slug with its `DOCKER_IMAGES_PAGE.<IMAGE>.DESCRIPTION` string; `scripts/node/repo-stats.mjs` fails when that registry differs from the `iamharryliu/*` images the repo's targets and workflows push.
- `/docker/:image` — README fetched from this repo's app README (vb-express uses its `docs/features/self-hosting.md`) via `raw.githubusercontent.com`: Docker Hub itself has no description set and its API has no CORS support for browser fetches, so content can't come from Docker Hub directly. Links out to the image's Docker Hub page.
- `/npm/:pkg` — README fetched from `registry.npmjs.org`, links out to the npm package.

## Web applications and API services

- `/web-applications/gravity-guy` and `/web-applications/gravity-guy-staging` — production at `gravity-guy.harryliu.dev` and protected staging Vercel deployments of the browser-local runner; both details use Gravity Guy's README.
- `/web-applications/bookmarks` — Bookmarks detail links to `bookmarks.harryliu.dev`, a browser-local bookmark manager.
- `/web-applications/:app` — app or demo detail with an Open application card above its README, fetched from `raw.githubusercontent.com`; Career uses the pages-index README. Only registered apps have cards and detail pages; removing a registry entry removes both.
- `/api-services/:service` — Swagger UI rendered in-app against a spec published at build time to `public/openapi/<service>.json` by the `generate-openapi` target (`scripts/generate-openapi-specs.ts`). All five services (llm-service, bucket-service, email-service, email-subscription-service, employee-handler) are private-only (the first four are private Fly apps; employee-handler is a library-hosted contract with no public `/docs`), so this page is the only way to browse them. The employee-handler spec is generated from the zod contract in `libs/@vigilant-broccoli/employee-handler`, whose sources are `generate-openapi` inputs. Swagger UI itself loads from a pinned jsDelivr CDN rather than bundling `swagger-ui-dist`.

The Job Hunt demo card opens the public, read-only sample deployment at `demo-job-hunt-next.vercel.app`; its detail page uses Job Hunt's README.
