# Pages Index

## Table of Contents

- [Stack](#stack)
- [Page Navigation](#page-navigation)
- [Agent Context](#agent-context)

## Stack

- Language - TypeScript
- Framework - React
- Build Tool - Vite
- External libs
  - Tailwind CSS (+ `@tailwindcss/typography` for rendered READMEs)
  - React Router
  - lucide-react
- Internal libs
  - `react-lib`
  - `react-utility` (`MarkdownViewer` — marked + DOMPurify)
- Cloud services
  - GitHub Pages

## Page Navigation

- `/` — Home
  - `/status` — Status (service health grouped by Production / Staging / Demo / Personal Apps from `iamharryliu/uptime`; unavailable monitoring data displays an error; GitHub Actions badges for both repositories)
  - `/repo-timeline` — Repo Timeline (lines of code, commits, PRs merged, lines added/deleted per day / month / year, shown as a horizontally scrollable bar chart or as react-lib's `ScrollTimeline`; data is `public/repo-timeline.json`, generated from `git log --numstat` by the `generate-repo-timeline` target (`scripts/generate-repo-timeline.ts`, lockfiles and >100K-line single-file changes excluded) and copied into `_site` on each Pages deploy)
  - `/open-source` — Open Source
    - GitHub → `/open-source/github` (README fetched from `raw.githubusercontent.com`, links out to the repo)
    - Docker Hub → `/open-source/docker` (list of `iamharryliu/*` images)
      - `/open-source/docker/:image` (README fetched from this repo's app README via `raw.githubusercontent.com` — Docker Hub itself has no description set and its API has no CORS support for browser fetches, so content can't come from Docker Hub directly; links out to the image's Docker Hub page)
    - npm → `/open-source/npm` (published `@vigilant-broccoli/*` packages)
      - `/open-source/npm/:pkg` (README fetched from `registry.npmjs.org`, links out to the npm package)
  - `/web-applications` - Web applications
    - Apps → harryliu.dev, Cloud8Skate, Docs (Markdown), Agent Context, Utilities, Component Library, Links, FindMe, Whiteboard, Weather (external)
    - Demo → Employee Handler
  - `/api-services` — API Services
    - `/api-services/:service` — Swagger UI rendered in-app against a spec published at build time to `public/openapi/<service>.json` by the `generate-openapi` target (`scripts/generate-openapi-specs.ts`). All five services (llm-service, bucket-service, email-service, email-subscription-service, employee-handler) are private-only (the first four are private Fly apps; employee-handler is a library-hosted contract with no public `/docs`), so this page is the only way to browse them. The employee-handler spec is generated from the zod contract in `libs/@vigilant-broccoli/employee-handler`, whose sources are `generate-openapi` inputs. Swagger UI itself loads from a pinned jsDelivr CDN rather than bundling `swagger-ui-dist`.
  - UI → `components.harryliu.dev` (external)

## Agent Context

- Page shells share one container width and gutter through `src/app/consts/layout.ts` (`PAGE_CLASS`, `FULL_HEIGHT_PAGE_CLASS`, `WIDE_FULL_HEIGHT_PAGE_CLASS`). A new page uses one of those rather than its own `max-w-*`/`px-*` combination, so the content column does not shift between routes.
- When adding, removing, or changing a route, card link, or external destination, update the `## Page Navigation` section above so it stays in sync with `src/app/app.tsx`, `src/app/consts/breadcrumbs.ts`, and the home-page cards.
- When a new kind of agent-context file appears in the repo (a new place `CONTEXT.md` points at, a new skills/commands directory), add it to the `context-md` app's `snapshot.config.json` `sources` and to the matching `paths` in `.github/workflows/deploy-context-md.yml` and `AGENT_CONTEXT_CHANGED` patterns in `.github/workflows/deploy-preview.yml` so context.harryliu.dev picks it up and redeploys on change.
