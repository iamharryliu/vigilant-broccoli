# GitHub Pages deploy pattern

One GitHub Pages site — `projects.vigilant-broccoli.app` — assembled from a shared `_site/` staging directory. Its only app is `projects-hub`, at the root; new static UIs go to Cloudflare Pages instead ([cloudflare-pages-deploy-pattern.md](./cloudflare-pages-deploy-pattern.md)). `projects-hub` also deploys to `staging-projects-hub` and `production-projects-hub` on Cloudflare Pages; this site keeps serving its production hostnames until they move there.

GitHub Pages permits one custom domain per site, so `status.vigilant-broccoli.app`, `career.harryliu.dev` and `deployments.vigilant-broccoli.app` serve the same `projects-hub` build through the `status-proxy` Cloudflare Worker rather than a second Pages attachment; a separate static deployment was not needed because the Worker passes assets, content types and errors through unchanged (see [network-management.md](../../../infrastructure/network-management.md#dns-urls)).

## How it works

- An app participates iff its `project.json` defines a `deploy-github-pages` target: `dependsOn: ["build"]`, copies `dist/<project>` into `_site/` (`parallel: false`).
- The `deploy-github-pages` job in `deploy.yml` runs on pushes to main only (the `production` branch never deploys Pages). It skips unless a project with the target is affected (or the run is a dispatch, or `deploy.yml` itself changed), then runs each app's target as an **explicit step** with `VITE_BASE_PATH` set to that app's serving path, uploads `_site` once (`upload-pages-artifact`), and deploys (`deploy-pages`).
- Build-time data generated into `public/` by a non-cached target (`projects-hub`'s `repo-timeline.json` and `project-graph.json`) is copied into `_site` by the `deploy-github-pages` target explicitly, on top of `dist/` — a cache-hit `build` would otherwise ship a stale copy.
- `component-library` is not staged on GitHub Pages; it lives on Cloudflare Pages at `components.vigilant-broccoli.app`.
