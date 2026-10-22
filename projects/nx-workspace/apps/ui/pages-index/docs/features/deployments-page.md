# Deployments page

- `DeploymentsPage` (`src/app/pages/DeploymentsPage.tsx`) is routed at `/deployments` on the projects host and at the root of `deployments.harryliu.dev` (hash routing, so the host is the only selector; see [page-navigation.md](./page-navigation.md#hosts)). The home page's Monitoring section links it.
- It renders `PreviewDeployments` from `@vigilant-broccoli/react-lib-higher-level`, the same component as `vb-manager-next`'s `/preview-deployments` ([feature doc](../../../vb-manager-next/docs/features/preview-deployments.md)), with the default `GRID` layout.
- pages-index is static and has no server, so the loader is `() => getPreviewDeployments()` from `@vigilant-broccoli/github-workspace-js` with no token: the browser calls the GitHub API directly (two calls per load, `/deployments` and open `/pulls`). Unauthenticated calls are limited to 60 per hour per IP, so the page fetches on load and Refresh only. Results are cached in memory for 3 minutes per page load.
- A rate-limited fetch shows the reset time but, with `showServerTokenHint={false}`, not the `GITHUB_TOKEN` server hint that `vb-manager-next` shows.
- Source of truth is GitHub Deployments written by `deploy-preview.yml`; see [workflow-conventions.md](../../../../../../../docs/ci/workflow-conventions.md#pr-previews).
