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

## A partial `observability` block on `cloudflare_workers_script` replans forever

In `cloudflare/cloudflare` 5.x, the nested attributes under
`cloudflare_workers_script.observability` — `head_sampling_rate`, `logs`, and
`traces` — are `optional` but **not** `computed` (only `logs.persist`,
`traces.persist` and `traces.propagation_policy` are). So a config that sets
only `observability = { enabled = true }` means "these are null", while the
Cloudflare API always returns its own defaults (`head_sampling_rate = 1`,
`logs` enabled with invocation logs and persistence, `traces` disabled).
Refresh writes those defaults into state, Terraform compares them against the
config's nulls, and every plan proposes the same update-in-place.

It isn't a cosmetic diff: because the change lands on the script resource
itself, every computed attribute (`etag`, `handlers`, `modified_on`,
`has_modules`, …) goes to `known after apply`, so each `pnpm tf:apply`
re-uploads the Worker. Applying never settles it — the next plan shows the
same diff.

Fix is to spell the object out in full so it matches what the API returns, as
`cloudflare-nx-cache.tf` now does for `nx-cache`. Any future
`cloudflare_workers_script` in this repo needs the same treatment.

## `vb-manager-next-mobile` ran the shell and the Google task list on two different sessions

The mobile app has two independent credentials, not one login: the Supabase
session (owned by the Supabase JS client, `localStorage`, auto-refreshed for as
long as the refresh token lives) and the Google `provider_token` captured once
at sign-in (no refresh, dead after ~1 hour). Its hand-rolled
`src/app/providers/auth-provider.tsx` predates the shared
`createSupabaseAuth` module and diverged from it in two ways that made the
split visible as "the task list is logged in but the shell isn't", or the
reverse:

- The Google token was stored in `sessionStorage` while the Supabase session
  sits in `localStorage`. Closing the PWA/tab dropped the Google token but kept
  the Supabase session, so the app reopened "signed in" with every
  Google-backed page instantly broken.
- `signOutDueToExpiredToken` was a plain alias for `signOut`, so any 401 from a
  Google-backed route (`tasks-input`, `calendar-input`, `my-calendar-view`)
  tore down the whole Supabase session — the exact failure the
  [supabase auth pattern](./ui/auth/supabase-auth-pattern.md) warns about, and
  why the session looked ~1 hour long. Meanwhile `/task-list` renders
  `GoogleTasksComponent` from `react-lib`, which does the right thing (clear
  only the Google token, prompt re-consent), so the two surfaces behaved
  differently on the same expiry.

Both are now aligned with `react-lib`: the Google token lives in
`localStorage`, and `reconnectGoogle` clears only that token before
re-requesting consent. Any other hand-rolled copy of this provider (e.g.
`employee-handler-ui`) still needs the same treatment.

## Jellyfin on the homelab Pi refuses to start when the media drive is missing

`docker compose up` reporting
`bind source path does not exist: /mnt/media/library`, or
`jellyfin-compose.service` failing with `Unit … has a bad unit file setting`
about a mount, is the design working. The external drive's fstab entry carries
`nofail` so the Pi still boots without it, and the container's media bind mount
sets `bind.create_host_path: false` while the unit declares
`RequiresMountsFor=/mnt/media`.

Without those two, Docker would create an empty `/mnt/media/library` on the
boot device and Jellyfin would start with an empty library — which looks
exactly like the media having been deleted, and is far harder to diagnose after
the fact than a service that declined to start. Check `findmnt /mnt/media` and
the drive's cabling/power first; `lsblk -f` shows whether the UUID in
`inventory/host_vars/<host>.yml` still matches. Details in
[jellyfin-pi.md](./infrastructure/jellyfin-pi.md).
