# Deployments page

- `DeploymentsPage` (`src/app/pages/DeploymentsPage.tsx`) is routed at `/deployments` on the projects host and at the root of `deployments.vigilant-broccoli.app` (hash routing, so the host is the only selector; see [page-navigation.md](./page-navigation.md#hosts)). The home page's Monitoring section links it.
- It renders `PreviewDeployments` from `@vigilant-broccoli/react-lib-higher-level`. `mobile-manager-next` links here from its Apps page.
- project-overview is static and has no server, so the loader is `() => getPreviewDeployments()` from `@vigilant-broccoli/github-workspace-js` with no token: the browser calls the GitHub API directly (two calls per load, `/deployments` and open `/pulls`). Unauthenticated calls are limited to 60 per hour per IP, so the page fetches on load, then every 5 minutes and when the tab becomes visible again after that long, never while hidden and not at all once rate-limited. There is no manual refresh button. Results are cached in memory for 3 minutes per page load.
- A rate-limited fetch shows the reset time.
- Source of truth is GitHub Deployments written by `deploy-preview.yml`; see [workflow-conventions.md](../../../../../../../docs/ci/workflow-conventions.md#pr-previews).
- The PR list is one column; at every width each card stacks the PR details above the app links (the phone layout is the standard layout), wrapping long branch names and links.
- Each PR card shows its branch with a copy button, then `by <author> · <commit> · <age>` taken from the newest app deployment on the PR. App names link to their previews with the project-overview card icon (`CARD_ICONS`, framework suffix `-react`/`-next`/`-ui` stripped), passed to `PreviewDeployments` as `renderAppIcon`.
