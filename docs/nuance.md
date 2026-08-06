# Repo nuances

Collection of non-obvious bugs and quirks discovered while working in this
repo — things that aren't derivable from reading the code alone.

## `@nx/next` build doesn't copy `deprecation.js` into `dist/.nx-helpers`

`@nx/next@23.0.1`'s build step copies its own `compose-plugins.js` helper into
`dist/apps/ui/vb-manager-next/.nx-helpers/` so the built app doesn't depend on
`@nx/next` at runtime. In this version, `compose-plugins.js` itself does
`require('./deprecation')` — but Nx's copy logic
(`create-next-config-file.js`) only walks and copies the relative imports of
the app's own `next.config.js`, not the imports of the helper file it just
copied. So `deprecation.js` never lands in `dist/.nx-helpers/`, and
`next start` throws `Error: Cannot find module './deprecation'` on every
boot — PM2 crash-loops the process (`errored`, restart count climbing, pid 0),
which surfaces as a 502 from anything proxying to it (e.g.
`manager.vigilant-broccoli.app` → `host.docker.internal:1337`).

This isn't caused by anything in this repo — it's an upstream Nx bug that
hits any fresh build of `vb-manager-next` with this `@nx/next` version.

Worked around in `projects/nx-workspace/apps/ui/vb-manager-next/project.json`:
the `build` target now chains
`node scripts/fix-next-config-helpers.js dist/apps/ui/vb-manager-next/.nx-helpers`
after `nx run vb-manager-next:build:next`, which copies the missing
`deprecation.js` from the installed `@nx/next` package (resolved via
`require.resolve('@nx/next/package.json')` rather than a hardcoded pnpm
content-hash path, since that hash changes across installs). Since
`pm2:start`/`pm2:reload` both `dependsOn: ["build"]`, this fixes it
transparently without patching vendored `node_modules` code.

## `wrangler pages deployment list --json` is capped to one page (25 items)

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

## `sharp` must stay in the nx-workspace root `dependencies`

`sharp` is only imported by the `hearth` app's `/api/where-is` route, so it
would normally belong in that app's own `package.json`. But Vercel's
serverless bundler for `hearth` only picks up native/optional deps like
`sharp` when they're hoisted into the workspace root `dependencies`
(`projects/nx-workspace/package.json`) — a dep declared solely in the app's
own `package.json` doesn't get bundled the same way, and the deployed
function fails to resolve `sharp` at runtime.

Keep `sharp` in the root `dependencies`, even though nothing at the root
imports it directly.
