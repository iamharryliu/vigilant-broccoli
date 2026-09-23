# CLAUDE — devops-cli

## Table of Contents

- [Nuances](#nuances)
  - [`wrangler pages deployment list --json` is capped to one page (25 items)](#wrangler-pages-deployment-list---json-is-capped-to-one-page-25-items)

## Nuances

Non-obvious traps in this directory — read the relevant entry **before**
working on the surface it names, not only when something breaks.
[nuance-pattern.md](../../../../../docs/nuance-pattern.md) is the convention.

### `wrangler pages deployment list --json` is capped to one page (25 items)

The command always returns at most 25 deployments, even when more exist. There
is no CLI flag to page past this. Consequences:

- Re-listing after a delete batch can still show 25 items even though real
  deletions succeeded — the next page's deployments slide into view.
- Any "did the count go down?" stale-detection is unreliable for projects with
  more than ~25 deployments.
- A loop that keeps deleting until the list count drops below `keep` can run
  for a long time (many delete calls) on a project with a large backlog,
  because the list never visibly shrinks below the page cap until the real
  total does. In CI this risks hitting the job timeout.

`WranglerService.pruneDeployments` deliberately does a **single bounded pass**:
list once (at most 25 IDs), delete everything beyond `keep` from that one
page, and stop — it does not loop to convergence. A project with a large
backlog needs multiple separate prune runs (e.g. one per deploy) to fully
drain, each clearing roughly one page's worth beyond `keep`.

Observed while pruning `cloud-8-skate-angular`: two consecutive
single-pass `prune-deployments` runs (keep=10) each deleted a page's worth
of distinct deployments successfully, yet `wrangler pages deployment list --json`
reported exactly 25 both times, before and after — confirming the list is
capped rather than the prune being stuck.

`WranglerService.deleteAllDeployments` (full project teardown) loops to
convergence instead — full teardown has no deploy-critical-path timeout
pressure. Because the listed count stays pinned at 25 for large backlogs, it
detects progress by comparing deployment ID sets between batches, not counts:
new IDs sliding into view (or the list shrinking) means deletions succeeded.
After 3 consecutive batches with zero ID turnover it throws (likely Cloudflare
rate limiting) rather than attempting a project delete that would fail with
deployments remaining. Deletes run at low concurrency with a delay between
batches to avoid rate limits, so teardown of a large backlog is slow — which
is why the vb-manager delete endpoint kicks it off in the background and the
UI polls a status endpoint instead of blocking on the DELETE request. Do not
change `pruneDeployments` to loop the same way.
