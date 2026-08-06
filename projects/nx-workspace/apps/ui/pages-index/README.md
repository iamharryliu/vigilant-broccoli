# Pages Index

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
  - `/status` — Status (service health grouped by Production / Staging / Personal Apps, GitHub Actions badges)
  - `/open-source` — Open Source
    - GitHub → `/open-source/github` (README fetched from `raw.githubusercontent.com`, links out to the repo)
    - Docker Hub → `/open-source/docker` (list of `iamharryliu/*` images)
      - `/open-source/docker/:image` (README fetched from this repo's app README via `raw.githubusercontent.com` — Docker Hub itself has no description set and its API has no CORS support for browser fetches, so content can't come from Docker Hub directly; links out to the image's Docker Hub page)
    - npm → `/open-source/npm` (published `@vigilant-broccoli/*` packages)
      - `/open-source/npm/:pkg` (README fetched from `registry.npmjs.org`, links out to the npm package)
  - `/web-applications` - Web applications
    - Apps → harryliu.dev, Cloud8Skate, Docs (Markdown), FindMe, Whiteboard (external)
    - Demo → Employee Handler
  - `/api-services` — API Services
    - `/api-services/:service` — Swagger UI rendered in-app against a spec published at build time to `public/openapi/<service>.json` by the `generate-openapi` target (`scripts/generate-openapi-specs.ts`). Covers private-only Fly services (llm-service, bucket-service) whose own `/docs` is unreachable from the internet, as well as the public ones. Swagger UI itself loads from a pinned jsDelivr CDN rather than bundling `swagger-ui-dist`.
  - `/ui` — UI
    - React Component Library → `./react-component-library/`
