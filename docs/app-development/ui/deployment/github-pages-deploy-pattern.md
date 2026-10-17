# GitHub Pages deploy pattern

One GitHub Pages site — `projects.harryliu.dev` — assembled from a shared `_site/` staging directory. Its only app is `pages-index`, at the root; new static UIs go to Cloudflare Pages instead ([cloudflare-pages-deploy-pattern.md](./cloudflare-pages-deploy-pattern.md)).

GitHub Pages permits one custom domain per site, so `status.harryliu.dev` serves the same `pages-index` build through the `status-proxy` Cloudflare Worker rather than a second Pages attachment; a separate static deployment was not needed because the Worker passes assets, content types and errors through unchanged (see [network-management.md](../../../infrastructure/network-management.md#dns-urls)).

## How it works

- An app participates iff its `project.json` defines a `deploy-github-pages` target: `dependsOn: ["build"]`, copies `dist/<project>` into `_site/` (`parallel: false`).
- The `deploy-github-pages` job in `deploy.yml` runs on pushes to main only (the `production` branch never deploys Pages). It skips unless a project with the target is affected (or the run is a dispatch, or `deploy.yml` itself changed), then runs each app's target as an **explicit step** with `VITE_BASE_PATH` set to that app's serving path, uploads `_site` once (`upload-pages-artifact`), and deploys (`deploy-pages`).
- Build-time data generated into `public/` by a non-cached target (`pages-index`'s `repo-timeline.json`) is copied into `_site` by the `deploy-github-pages` target explicitly, on top of `dist/` — a cache-hit `build` would otherwise ship a stale copy.
- `component-library` is not staged on GitHub Pages; it lives on Cloudflare Pages at `components.harryliu.dev`.
