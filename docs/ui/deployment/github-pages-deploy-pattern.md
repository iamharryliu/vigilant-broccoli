# GitHub Pages deploy pattern

One GitHub Pages site — `iamharryliu.github.io/vigilant-broccoli` — assembled from a shared `_site/` staging directory: `pages-index` at the root, `component-library` under `/react-component-library/`.

## How it works

- An app participates iff its `project.json` defines a `deploy-github-pages` target: `dependsOn: ["build"]`, copies `dist/<project>` into its `_site/` sub-path (`parallel: false`; clear your own subdir first — see `component-library`).
- The `deploy-github-pages` job in `deploy.yml` runs on pushes to main only (the `production` branch never deploys Pages). It skips unless a project with the target is affected (or the run is a dispatch, or `deploy.yml` itself changed), then runs each app's target as an **explicit step** with `VITE_BASE_PATH` set to that app's serving sub-path, uploads `_site` once (`upload-pages-artifact`), and deploys (`deploy-pages`).
- Apps must build against a configurable base path (`VITE_BASE_PATH`) because they serve under a sub-path of the repo site.
- Build-time data generated into `public/` by a non-cached target (`pages-index`'s `repo-timeline.json`, `claude-context/`) is copied into `_site` by the `deploy-github-pages` target explicitly, on top of `dist/` — a cache-hit `build` would otherwise ship a stale copy. Data whose sources live outside the nx workspace (the Claude-context snapshot reads `CLAUDE.md`, `docs/`, `setup/dotfiles/.claude/`) is invisible to `nx affected`, so `deploy.yml` lists those paths as push triggers and its `CLAUDE_CONTEXT_CHANGED` check forces the Pages job when they change.

## New app checklist

1. `deploy-github-pages` target copying the build output into a unique `_site/<sub-path>/` (copy `component-library`).
2. An explicit staging step in `deploy.yml`'s `deploy-github-pages` job with the app's `VITE_BASE_PATH` — the job does **not** discover targets dynamically; without the step the app never lands in `_site`.
3. A card in `pages-index`'s `UiPage.tsx` linking to the sub-path.
