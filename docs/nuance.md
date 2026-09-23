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

## A headless Pi boots, pings, and has no user account

Raspberry Pi OS images ship a cloud-init NoCloud seed on the boot partition
(`user-data`, `network-config`, `meta-data`). Editing those files to create a
user, install a key or configure Wi-Fi looks like the supported path and
silently does nothing on a card that has already booted once.

The shipped `meta-data` writes `instance_id` with an underscore. cloud-init's
NoCloud datasource reads `instance-id` with a hyphen, so the key is ignored and
the instance id falls back to the literal string `nocloud`. Because that value
then never changes, cloud-init treats every later boot as the same instance and
skips all per-instance modules — `users`, `runcmd`, and the network config
among them. `update_hostname` runs per-always, so the hostname from an edited
`user-data` _does_ apply, which makes it look like the file was read.

Symptoms: the Pi answers ping and mDNS under the hostname you set, `sshd`
refuses every login with "SSH may not work until a valid user has been set up",
and `/etc/netplan/` is empty. `cloud-init status --long` reports
`extended_status: degraded done` and `cat /var/lib/cloud/data/instance-id`
prints `nocloud`.

Use the Pi-native mechanisms instead — they are independent of cloud-init and
run on every boot that finds them:

- `/boot/firmware/userconf.txt` = `username:<sha512crypt>` (`openssl passwd -6`)
  → `userconf-pi` creates the account.
- Empty `/boot/firmware/ssh` → `sshswitch.service` enables `sshd`.

Raspberry Pi Imager's own customisation writes whatever the current image
consumes, so it stays the right answer for a fresh flash. Details in
[jellyfin-pi.md](./infrastructure/jellyfin-pi.md).

## A Pi's Wi-Fi radio is rfkill-blocked until the WLAN country is set

On a fresh Raspberry Pi OS install `wlan0` reports state `unavailable`,
`nmcli radio` shows `WIFI: disabled`, and a scan returns nothing — on hardware
whose driver loaded perfectly (`brcmfmac` firmware lines are in `dmesg`). The
radio is soft-blocked pending a regulatory domain: `/sys/class/rfkill/*/soft`
reads `1` for `phy0`.

`sudo raspi-config nonint do_wifi_country SE` clears it, after which `wlan0`
moves to `disconnected` and scanning works. Note `rfkill` itself is not
installed on Lite images, so the usual `rfkill list` diagnostic is unavailable;
read `/sys/class/rfkill/rfkill*/soft` directly.

A connection to a **hidden** SSID additionally needs
`802-11-wireless.hidden yes` on the NetworkManager connection, or it fails with
"The Wi-Fi network could not be found" even when the credentials are right.

## A double-quoted font family silently kills the whole `style="..."` attribute

`.github/scripts/agentic-solve-email.mjs` builds email HTML by string
concatenation, and the sans stack was written the way every CSS snippet on the
web writes it:

```js
const SANS_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
```

Interpolated into `style="font-family:${SANS_FONT};..."`, the `"` before
`Segoe` closes the attribute. Everything after it — the font size, the colours,
the margins — becomes stray attributes the parser discards, so the element
renders with browser defaults. The symptom is bizarre: headings and body text
come out in a serif face while the class-styled parts of the same document look
fine, and nothing in the CSS is wrong. There is no error anywhere; the HTML is
still well-formed enough to parse.

Any family name needing quotes (`'Segoe UI'`, `'SF Mono'`, `'Helvetica Neue'`)
must use single quotes when the stack can land inside a double-quoted HTML
attribute. Single quotes are equally valid CSS, so the same constant stays
usable in a `<style>` block.

## A trailing `cmd && ...` in an rc file makes sourcing it return non-zero

`.rc.bash` ended with `command -v mise >/dev/null && eval "$(mise activate
bash)"`. On a machine without mise (every Linux box — mise is only in the mac
`Brewfile`) the `command -v` fails, so the last statement of the file returns
1, and therefore so does `source .rc.bash`. Nothing is printed; the file did
exactly what it was told.

That broke `test-smoke-machine-setup`'s "Verify the rc chain sources cleanly"
step, whose whole point is to source the file under `set -e`. The failure was
opaque: because stderr was redirected to a log the step only inspects _after_
the source, `set -e` aborted first and the step failed with no output at all.

Guard optional activations with `if command -v x; then ... fi` (the form
`.rc.zsh` already uses) rather than an `&&` one-liner, so the file always ends
on a zero status. The same trap applies to any rc file: a non-zero exit leaks
into `$?` at the start of every shell and aborts any `set -e` script that
sources it.

## Sticky headings punch holes in a mobile overlay scrollbar

`vb-manager-next-mobile`'s phone agenda (`src/app/components/my-calendar-view.tsx`)
used to be its own scroll container (`overflow-y-auto`) with one
`position: sticky` date heading per day group. On phones the scrollbar is an
_overlay_ scrollbar — it is painted over the content inside the scroller's own
box rather than in a reserved gutter. Chromium paints positioned/composited
descendants of a scroller above that overlay layer, so every sticky heading
(not just the one currently stuck) erased the slice of the thumb sitting behind
it. The result looked like the scrollbar itself was dashed: one gap per day
group, visible only while scrolling, and impossible to explain from the CSS of
the scrollbar because nothing in the repo styles scrollbars at all.

The fix is structural, not cosmetic: the phone agenda no longer scrolls itself.
The page grows (`PAGE_HEIGHT_MOBILE_SCROLL` in
`src/app/components/app-shell.constants.ts`) and the document scrolls, which
moves the overlay scrollbar out to the viewport edge — outside the card, so no
sticky heading can overlap it. The headings keep sticking, now against the
document, which is why their offset is `top-[var(--topbar-h)]` (clearing the
fixed topbar) instead of `top-0`.

Any other phone surface that combines a nested `overflow-y-auto` with sticky
section headers will reproduce this. Prefer letting the page scroll.

## A replaced OCI VM dies on `container name "/watchtower" is already in use`

`pnpm tf:apply` that replaces `oci_core_instance.rabbitmq` — any change to its
`metadata.user_data`, since that forces replacement — can fail in the
`post-apply` step with a Docker name conflict on `/watchtower`, and sometimes
on `caddy` or `socket-server-socketio` instead depending on who wins.

The VM hosts two compose projects: the broker (`/opt/rabbitmq`) and the
socket-server stack (`/opt/socket-server`, which is where `watchtower` lives).
`post-apply.sh`'s `sync_socket_server` calls
`packer/scripts/sync-socket-server-token.sh`, which SSHes in, rewrites
`SENDER_TOKEN`, and runs `docker compose -f /opt/socket-server/docker-compose.yml
up -d`. Its readiness probe used to be `test -f <that compose file> && sudo
docker info` — and both of those go true early in `cloud-init`, because
`write_files` writes the compose file before anything runs and `runcmd`'s
`systemctl start docker` is several steps ahead of `runcmd`'s own `docker
compose up -d` at the end. So the script and cloud-init ran `up -d` against the
same project concurrently. Each service there sets an explicit
`container_name:`, which compose cannot namespace per-project, so the loser of
the race aborts on the name instead of adopting the container.

It stayed hidden because the VM is normally long-lived: cloud-init finished
months earlier, so the sync script's `up -d` was a no-op. Only an actual
instance replacement puts the two on the same clock — first seen when tightening
the RabbitMQ TLS key to `0600` changed `user_data`.

The quieter half of the same race is worse than the loud one. `runcmd` rewrites
`DOCKER_API_VERSION_PLACEHOLDER` in that compose file one line before it brings
the stack up, so a sync script that wins can create `watchtower` with the
literal placeholder as its `DOCKER_API_VERSION`. That container starts, stays
up, and silently never talks to the Docker API again — socket-server images
just stop auto-updating, with nothing in the apply output to connect it back.

The gate now waits for `cloud-init status` to report `done` (or `degraded
done`) before touching compose. If this resurfaces, check, in order:
`cloud-init status --long`, `grep DOCKER_API_VERSION
/opt/socket-server/docker-compose.yml`, and `sudo docker inspect watchtower
--format '{{.Config.Env}}'`. Recovery is `sudo docker compose -f
/opt/socket-server/docker-compose.yml up -d --force-recreate` once cloud-init
is done, then a rerun of `pnpm tf:post-apply`, which is idempotent.

## A failed kanban board fetch used to look like a brand-new account

`vb-manager-next`'s kanban board (`src/app/components/kanban.component.tsx`,
`useBoards`) persists boards to MongoDB per `userEmail`
(`src/app/api/kanban/db.ts`). `fetchKanbanState` used to return `null` for
_any_ non-OK HTTP response from `GET /api/kanban/boards` — collapsing a real
error (an expired/invalid auth token, a transient failure in
`getUserEmail`'s `supabase.auth.getUser(token)` call, a Mongo connection
blip) into the exact same value as "this user has never saved a board."

`hydrate()` treated that value as license to fall through its full
first-time-user path: check `localStorage` (empty, since existing users'
local boards were already migrated and cleared), find nothing, then create a
default empty board and immediately `PUT` it — upserting over the real saved
document. One transient GET failure was enough to permanently wipe a user's
boards on the very next write, with no merge or backup: `saveKanbanState`
does a plain `$set` upsert.

Fixed by making `fetchKanbanState` return a tagged result
(`{ ok: true, state } | { ok: false }`) so `hydrate()` can bail out on a
failed fetch without ever reaching the default-board-creation/persist path.
Any other client-side hydration flow that falls back to "create and save a
default" needs to make the same distinction between a failed load and a
confirmed-empty one.

## A `react-lib` component renders unstyled in an app that never scanned it

Tailwind only generates classes it finds in its `content` globs, and each
app's `tailwind.config.js` lists the internal libs it scans by hand. When
`personal-website-react` started using `react-lib`'s `Sidebar`, the lib's
glob was never added, so every class that only appears inside the lib
(`max-md:-translate-x-full`, `max-md:w-64`, `md:w-14`, ...) was missing from
the CSS. Classes the app happened to use elsewhere still worked, so the
sidebar half-rendered: on mobile it sat on-screen over the page instead of
sliding off-canvas and blocked the menu button. Nothing fails at build or
lint time. Whenever an app starts importing a new internal UI lib, add that
lib's `src/**` glob to the app's Tailwind `content`.

## A new OCI API key returns 401 for ~5 minutes while reporting `ACTIVE`

`POST /20160918/users/{id}/apiKeys` returns the uploaded key immediately, with
the fingerprint you computed locally and `lifecycleState: ACTIVE`. Listing the
user's keys shows it as `ACTIVE` too. But every request _signed_ with it gets
`401 NotAuthenticated` until it finishes syncing to the identity domain —
measured at 307s in this tenancy, with the state field reading `ACTIVE` for the
entire window.

So there is nothing to poll except the signed request itself: no state
transition ever happens, because the resource is created active and only the
authentication path lags. Polling early is harmless — it neither delays nor
accelerates acceptance — so the only correct strategy is a long retry window.
`packer/scripts/rotate-oci-api-key.sh` waits 180s, then retries for another
450s.

Worth knowing when debugging: a rotation that fails "verification" here is
almost always this, not a signing bug. Check by re-signing the same request a
few minutes later before suspecting the signature.
