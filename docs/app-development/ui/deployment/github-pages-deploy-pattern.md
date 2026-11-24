# GitHub Pages deploy pattern

One GitHub Pages site — `projects.vigilant-broccoli.app` — assembled from a shared `_site/` staging directory. Its only app is `project-overview`, at the root; new static UIs go to Cloudflare Pages instead ([cloudflare-pages-deploy-pattern.md](./cloudflare-pages-deploy-pattern.md)). `project-overview` also deploys to `staging-project-overview` and `production-project-overview` on Cloudflare Pages; this site keeps serving its production hostnames until they move there.

GitHub Pages permits one custom domain per site, so `status.vigilant-broccoli.app`, `career.harryliu.dev` and `deployments.vigilant-broccoli.app` serve the same `project-overview` build through the `status-proxy` Cloudflare Worker rather than a second Pages attachment; a separate static deployment was not needed because the Worker passes assets, content types and errors through unchanged (see [network-management.md](../../../infrastructure/network-management.md#dns-urls)).

## How it works

- An app participates iff its `project.json` defines a `deploy-github-pages` target: `dependsOn: ["build"]`, copies `dist/<project>` into `_site/` (`parallel: false`).
- The `deploy-github-pages` job in `deploy.yml` runs on pushes to main only (production deploys never deploy Pages: `deploy-release` passes `skip_pages`). It skips unless a project with the target is affected (or the run is a dispatch, or `deploy.yml` itself changed), then runs each app's target as an **explicit step** with `VITE_BASE_PATH` set to that app's serving path, uploads `_site` once (`upload-pages-artifact`), polls the run's artifact list for up to 60 seconds until the upload is listed (`deploy-pages` looks it up once and the list lags the upload), and deploys (`deploy-pages`).
- Build-time data generated into `public/` by a non-cached target (`project-overview`'s `repo-timeline.json` and `project-graph.json`) is copied into `_site` by the `deploy-github-pages` target explicitly, on top of `dist/` — a cache-hit `build` would otherwise ship a stale copy.
- `component-library` is not staged on GitHub Pages; it lives on Cloudflare Pages at `components.vigilant-broccoli.app`.
