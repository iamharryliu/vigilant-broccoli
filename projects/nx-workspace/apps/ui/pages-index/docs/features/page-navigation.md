# Page navigation

Route map for pages-index. Keep it in sync with `src/app/app.tsx`, `src/app/consts/breadcrumbs.ts` and the home-page cards.

- `/` — Home
  - `status.harryliu.dev` — the same `StatusPage` at the host root. `app.tsx` picks the status route table when `window.location.hostname` is `STATUS_HOST` (`src/app/consts/hosts.ts`); other hash routes redirect to `/`. The Home breadcrumb and any other pages-index link there are explicit `https://projects.harryliu.dev/#/…` URLs, built with `toProjectsUrl`. The Status page's Uptime tab embeds `uptime.harryliu.dev` (the Upptime site).
  - `career.harryliu.dev` — `CareerPage` at the host root (cards: Resume → `harryliu.dev/resume`, Personal Software Career Experience, `projects.harryliu.dev`, `harryliu.dev`, GitHub, LinkedIn). `app.tsx` picks the career route table when the hostname is `CAREER_HOST`; other hash routes redirect to `/`.
    - `/personal-software-career-experience` — renders `notes/personal/personal-software-career-experience.md` from `raw.githubusercontent.com`; its breadcrumb returns to the career root.
  - `/status` — Status (service health grouped by Production / Staging / Demo / Personal Apps from `iamharryliu/uptime`; unavailable monitoring data displays an error; GitHub Actions badges for both repositories, in the Status tab; the Uptime tab lists the same services with 24h/7d/30d/1y uptime and a 30-day downtime strip from `summary.json`, plus a "Full uptime history" link to `uptime.harryliu.dev`)
  - `/repo-timeline` — Repo Timeline (lines of code, commits, PRs merged, lines added/deleted per day / month / year, shown as a horizontally scrollable bar chart or as react-lib's `ScrollTimeline`; data is `public/repo-timeline.json`, generated from `git log --numstat` by the `generate-repo-timeline` target (`scripts/generate-repo-timeline.ts`, lockfiles and >100K-line single-file changes excluded) and copied into `_site` on each Pages deploy)
  - `/open-source` — Open Source
    - GitHub → `/open-source/github` (all public `iamharryliu` repositories, fetched from the paginated GitHub API)
      - `/open-source/github/:repo` — README fetched through the GitHub API from the default branch, with a link to the repository; loading, empty and fetch errors are displayed.
    - Docker Hub → `/open-source/docker` (list of `iamharryliu/*` images)
      - `/open-source/docker/:image` (README fetched from this repo's app README via `raw.githubusercontent.com` — Docker Hub itself has no description set and its API has no CORS support for browser fetches, so content can't come from Docker Hub directly; links out to the image's Docker Hub page)
    - npm → `/open-source/npm` (published `@vigilant-broccoli/*` packages)
      - `/open-source/npm/:pkg` (README fetched from `registry.npmjs.org`, links out to the npm package)
  - `/web-applications` - Web applications
    - `/web-applications/:app` — app or demo detail with an Open application card above its README, fetched from `raw.githubusercontent.com`; Career uses the pages-index README.
    - Apps → harryliu.dev, Calendars, Cloud8Skate, Docs (Markdown), Agent Context, Utilities, Waiting Games, Component Library, Links, FindMe, Whiteboard, Weather, Balloono (detail pages)
    - Demo → Employee Handler
  - `/api-services` — API Services
    - `/api-services/:service` — Swagger UI rendered in-app against a spec published at build time to `public/openapi/<service>.json` by the `generate-openapi` target (`scripts/generate-openapi-specs.ts`). All five services (llm-service, bucket-service, email-service, email-subscription-service, employee-handler) are private-only (the first four are private Fly apps; employee-handler is a library-hosted contract with no public `/docs`), so this page is the only way to browse them. The employee-handler spec is generated from the zod contract in `libs/@vigilant-broccoli/employee-handler`, whose sources are `generate-openapi` inputs. Swagger UI itself loads from a pinned jsDelivr CDN rather than bundling `swagger-ui-dist`.
  - UI → `components.harryliu.dev` (external)
