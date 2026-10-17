# Agent Context — devops-cli

## Table of Contents

- [Nuances](#nuances)
  - [`wrangler pages deployment list --json` is capped to one page (25 items)](#wrangler-pages-deployment-list---json-is-capped-to-one-page-25-items)

## Nuances

### `wrangler pages deployment list --json` is capped to one page (25 items)

The CLI exposes at most 25 deployments with no pagination flag. After deletion, older IDs slide into view, so an unchanged count does not mean deletion failed.

`WranglerService.pruneDeployments` lists once and deletes only that page's entries beyond `keep`; repeated deploy runs drain a backlog without exhausting the CI timeout. Do not turn it into a convergence loop.

`deleteAllDeployments` must drain the whole project. It compares ID sets, uses low concurrency and delays, and throws after three batches without ID turnover. Because large teardowns are slow, the manager starts them in the background and polls status.
