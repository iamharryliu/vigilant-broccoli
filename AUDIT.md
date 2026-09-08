# Commit Audit — 2026-06-08 → 2026-09-08

Rolling audit of the last three months of commits, looking for severe issues introduced by that
work. Findings are ordered by severity. Each entry names the commit that introduced the behaviour
so the change can be traced back.

Passes so far, oldest window last:

| Pass | Window                  | Non-Upptime commits | Added  |
| ---- | ----------------------- | ------------------- | ------ |
| 5    | 2026-08-23 → 2026-09-08 | 47                  | D1     |
| 5    | 2026-06-08 → 2026-07-14 | 297 (back-fill)     | D2, D3 |
| 4    | 2026-08-19 → 2026-08-23 | 29                  | C1     |
| 3    | 2026-08-15 → 2026-08-19 | 55                  | B1, B2 |
| 2    | 2026-07-14 → 2026-08-15 | 405                 | A1–A8  |

Pass 5 widened the window to a rolling three months. That back-fill is what promoted D2 and D3:
both were previously logged under "pre-existing issues noticed en route" because they landed
before the old window opened, and both now fall inside it. The back-fill window is dominated by
CI/infra churn from the repo's buildout era (workflow renames, Terraform restructuring, secret
plumbing), most of it since superseded; it was reviewed by filtering to commits touching API
routes, migrations, auth, Terraform and workflows rather than read commit-by-commit, so it is
covered less exhaustively than the app-feature windows above.

Pass 5 also re-verified every open finding against `main` at 2026-09-08 — see
[Re-verification](#re-verification--2026-09-08). All of A3–A8, B1, B2 and C1 are still open, with
no partial mitigations landed.

Relevant context for severity: `hearth` is deployed publicly (`staging-hearth.vercel.app`,
`production-hearth.vercel.app`) with **open self-serve signup**
(`apps/hearth/src/app/(auth)/signup/page.tsx` calls `supabase.auth.signUp` with no allowlist), so
"any authenticated user" means anyone on the internet who registers an account.

## Summary

| ID  | Severity | Status | Area             | Issue                                                                                              |
| --- | -------- | ------ | ---------------- | -------------------------------------------------------------------------------------------------- |
| A1  | Critical | Fixed  | hearth           | Arbitrary R2 object read + delete via client-supplied staged key                                   |
| A2  | High     | Fixed  | hearth           | Presigned-download hardening for home docs is defeated by the bucket's public `r2.dev` hostname    |
| A3  | High     | Open   | vb-express       | SSRF in `POST /api/recipe/scrape` reaches Fly 6PN private-only services                            |
| B1  | High     | Open   | bucket-service   | `bucketName` accepted from the caller with no allowlist, now fronting private home-docs/where-is   |
| D1  | High     | Open   | react-lib        | Supabase Realtime rooms are public channels, so CRDT sync bypasses the RLS on the same data        |
| D2  | High     | Open   | hearth           | `GET /api/homes/[id]/members` discloses the home owner's email with no authentication              |
| A4  | Medium   | Open   | hearth           | Presigned uploads are unbounded in size and never garbage-collected                                |
| A5  | Medium   | Open   | hearth           | Home-invite acceptance trigger now swallows every error silently                                   |
| A6  | Medium   | Open   | hearth           | LLM-backed routes have no rate limit or budget guard                                               |
| B2  | Medium   | Open   | employee-handler | Unescaped employee name interpolated into a shell command in the new birthday-sync Calendar target |
| C1  | Medium   | Open   | nx-workspace     | Vercel env-var prune deletes a live production secret whenever its Vault fetch fails               |
| A7  | Low      | Open   | vb-manager-next  | TODO.md serializer can silently delete rows it failed to parse                                     |
| A8  | Low      | Open   | hearth           | `getBearerToken` strips `Bearer ` by substring replace, not by prefix                              |
| D3  | Low      | Open   | ci               | `manual-deploy-app.yml` interpolates a dispatch input straight into a `run:` block                 |

---

## A1 — Arbitrary R2 object read and delete via staged key (Critical, fixed)

- Introduced: `d6dbcd1c7` — _feat(hearth): Switch where-is and docs photo/file uploads to presigned direct-to-R2 uploads_ (#307, 2026-08-04)
- Fixed: `78d07601d` — _security(hearth): Validate staged R2 keys before reading or deleting them._ (#364, 2026-08-15)
- Files: `apps/hearth/src/app/api/where-is/route.ts`, `apps/hearth/src/app/api/docs/route.ts`

The presigned-upload rework had `POST /api/where-is` and `POST /api/docs` accept a client-supplied
`key` for the staged object, then `readImage(key)` / `readFile(key)` it and `deleteImage(key)` /
`deleteFile(key)` it in a `finally`. Neither route checked the key against the `staging/` prefix, so
any signed-up user could pass any key in the `home-management` bucket — another household's
`docs/<docId>/<uuid>.pdf`, for example — and have the server fetch it _and then delete it_.

Exposed for 11 days. The fix adds `assertStagedKey` in both routes, rejecting keys outside
`staging/docs/` and `staging/where-is/` before touching R2. That is the correct fix; no follow-up
needed on this specific path.

## A2 — Home-doc presigned URLs are defeated by the bucket's public `r2.dev` hostname (High, fixed)

- Introduced (incomplete fix): `2a04846c6` (#311, 2026-08-04)
- Fixed: `536136a03` — _security(hearth): Move home docs and where-is photos to private R2 buckets._ (#441, 2026-08-15), completed by `55f46aa01`/`aadff07d9` (#488/#492, 2026-08-18), which moved both buckets behind `bucket-service` entirely and removed hearth's own R2 credentials.
- Files: `apps/hearth/src/app/api/docs/r2.ts`, `apps/hearth/src/app/api/where-is/r2.ts`, `infrastructure/terraform/main.tf`

The shared `home-management` bucket (with its public `r2.dev` hostname) was deleted and replaced by
two dedicated buckets, `home-docs` and `where-is`, neither ever given a public `r2.dev` hostname
(`infrastructure/terraform/main.tf:642`). Downloads now go exclusively through short-lived presigned
URLs issued by `bucket-service`. Confirmed no remaining reference to `R2_PUBLIC_URL` or `r2.dev` in
`apps/hearth`. See B1 below for a new issue introduced by this same migration.

## A3 — SSRF in the recipe scraper reaches Fly private-only services (High, open)

- Introduced: `67bcacb80` — _feat(recipe-scraper): Add image input and move scraping logic to vb-express_ (#99, 2026-07-18)
- File: `apps/api/vb-express/src/routes/recipe.ts` (`isAllowedUrl`, `scrapeUrl`)

`POST /api/recipe/scrape` fetches a caller-supplied URL server-side from `vb-express`, which runs on
Fly and — per `docs/infrastructure/network-management.md` — sits on the same 6PN network as
`production-llm-service.flycast`, `production-vb-email-service.flycast`,
`production-storage-service.flycast` and `production-email-subscription-service.flycast`, all of
which are deliberately private-only with no public IP. `isAllowedUrl` is the only guard, and it has
several gaps:

1. **Redirects are unchecked.** `fetch(url)` follows redirects by default and only the _initial_ URL
   is validated, so any attacker-controlled public host can `302` to an internal address.
2. **`.flycast` is not blocked.** `PRIVATE_HOSTNAME_SUFFIXES` is `['.local', '.internal']`, so
   `http://production-llm-service.flycast/` passes — the exact hostname family this repo uses for
   private service-to-service calls.
3. **Fly 6PN IPv6 is not blocked.** Only `[::1]` and `[fe80:` are rejected; Fly's `fdaa::/16` and
   ULA `fc00::/7` are not.
4. **`100.64.0.0/10` is not blocked.** `isPrivateIpv4` covers 127/10/0, 169.254, 172.16–31 and
   192.168 — but not the CGNAT range Tailscale uses, which this repo relies on extensively.
5. **Non-dotted-quad IP encodings bypass the check.** `isPrivateIpv4` returns `false` for anything
   that is not four dot-separated numbers, so `http://2130706433/` (127.0.0.1) is allowed.
6. **No DNS resolution check**, so a public hostname pointing at a private address passes.

The scraped page body is fed to the LLM and its extraction returned to the caller, making this a
read primitive, not just a blind request. Reaching it requires a `RECIPE`-scoped vb-express API key
(`registerService(app, '/api/recipe', VB_EXPRESS_SERVICE.RECIPE, …)`), so the practical impact is
privilege escalation: a key scoped to one narrow capability becomes internal-network access to the
services that were made private on purpose (`f5e163d7c`, `test-security-private-network-exposure.yml`).

Suggested fix: `redirect: 'manual'` with per-hop re-validation, resolve the hostname and validate
every resolved address rather than the literal string, and add `.flycast`, `fc00::/7`,
`100.64.0.0/10` to the deny set.

## A4 — Presigned uploads are unbounded and never garbage-collected (Medium, open)

- Introduced: `d6dbcd1c7` (#307, 2026-08-04)
- Files: `apps/hearth/src/app/api/{where-is,docs}/upload-url/route.ts`, `.../r2.ts`

`createImageUploadUrl` / `createFileUploadUrl` sign only `Key` and `ContentType`. The `size` the
client declares is validated by zod against `MAX_IMAGE_SIZE_BYTES` (10 MB) / `MAX_FILE_SIZE_BYTES`
(20 MB), but that number is never bound into the signature — so the returned URL will accept a PUT of
any size. The `ContentLength` check in `readImage` / `readFile` only rejects the object _after_ it is
already stored and billed.

Worse, staged objects are only deleted in the `finally` of `readAndProcessStagedFiles`. A client that
requests upload URLs, PUTs, and never calls `POST /api/where-is` leaves the objects in `staging/`
permanently: `infrastructure/terraform/main.tf` manages only CORS for `home-management`, with no
`cloudflare_r2_bucket_lifecycle` (unlike `nx-cache`, which has one).

Suggested fix: sign with `ContentLength`, and add a lifecycle rule expiring the `staging/` prefix.

## A5 — Invite-acceptance trigger now swallows every error (Medium, open)

- Introduced: `a4151c785` — _fix(hearth): Stop a failing invite trigger from blocking new user signups._ (#395, 2026-08-12)
- File: `apps/hearth/supabase/migrations/20260812000026_harden_accept_invites_trigger.sql`

The migration wraps `accept_home_member_invites` in `exception when others then return new;`. It does
unblock signup, and pinning `search_path = ''` on a `security definer` function is right. But
catching _every_ exception with no logging means a user who signs up against a pending invite can
silently never be added to the home — no error surfaces to the client, the trigger, or the logs, and
the row stays `pending` forever. This converts a loud failure into a silent one on the path that
onboards every new household member.

Suggested fix: catch only what actually broke signup and `raise warning` the rest, so failures stay
observable.

## A6 — LLM routes have no rate limit or budget guard (Medium, open)

- Introduced: `ac4420e38` / `85862a936` era Food Planner work (2026-08-13/14)
- Files: `apps/hearth/src/app/api/food-planner/chat/route.ts`, `.../extract-ingredients/route.ts`

Both routes check only that a Supabase session exists, then forward caller-supplied content to
vb-express with the server-side API key. `RequestSchema` bounds neither the number of messages, the
length of each message, nor the size of each markdown blob (`z.array(z.string().min(1)).min(1)` has
no `.max()`). With open self-serve signup this is a direct cost-amplification path against the
OpenAI/Anthropic spend behind `VB_EXPRESS_API_KEY`.

Suggested fix: cap message count and per-message length in the schemas, and add per-user rate limiting.

## A7 — TODO.md serializer can silently delete rows it failed to parse (Low, open)

- Introduced: `543d93337`, `a6545a0be` (#408, #415, 2026-08-13)
- File: `apps/ui/vb-manager-next/src/app/api/todo/_lib/todo-markdown.utils.ts`

`parseTodoMarkdown` drops any table row whose `splitRowCells` yields fewer than four cells, and keeps
only the first four cells of longer rows. `serializeTodoMarkdown` then regenerates the entire table
from the parsed `rows` array. Any row the parser did not understand is therefore erased from
`TODO.md` on the next write, with no error. `a6545a0be` removed the explicit Save button in favour of
autosave-on-blur, so this now fires without a deliberate user action. `TODO.md` is also the input
`infrastructure/agent-sandbox/solve-todo*.sh` parses.

Suggested fix: preserve unparsed rows verbatim instead of dropping them, or refuse to serialize a
section whose parsed row count does not match the source row count.

## A8 — `getBearerToken` strips by substring replace (Low, open)

- File: `apps/hearth/libs/supabase-server.ts`

`request.headers.get(AUTHORIZATION_HEADER)?.replace(BEARER_PREFIX, '')` removes the first occurrence
of `Bearer ` anywhere in the header rather than stripping a prefix. The same pattern appears inline as
`?.replace('Bearer ', '')` in several hearth routes. Harmless with well-formed headers; use
`slice(BEARER_PREFIX.length)` after a `startsWith` check, as `libs/server-auth.ts` in
`vb-manager-next` already does.

---

## Follow-up — 2026-08-15 → 2026-08-19

Second pass covering the 55 non-Upptime commits landed since the review above. A2 (above) is now
fixed. New findings below.

## B1 — `bucket-service` accepts a caller-supplied bucket name with no allowlist (High, open)

- Introduced (widened blast radius): `55f46aa01` — _feat(hearth): Route R2 photo/doc storage through bucket-service instead of hearth's own Cloudflare credentials._ (#488, 2026-08-18); `aadff07d9` — _fix(hearth): Route bucket-service requests through vb-express instead of hitting it directly._ (#492, 2026-08-18)
- Files: `apps/api/bucket-service/src/routes/bucket.ts` (`resolveBucketName`, lines 64–69), `apps/api/vb-express/src/routes/bucket.ts` (`toParams`, lines 9–10), `libs/@vigilant-broccoli/storage/src/lib/bucket/providers/cloudflare.provider.ts` (`this.bucketName`, lines 36–37)

The A2 fix (private `home-docs`/`where-is` buckets, see above) relies on `bucket-service` as the sole
path to those buckets. `bucket-service`'s `resolveBucketName` reads `bucketName` straight from the
caller's query string or body with no allowlist, and `getBucketService` passes it unchecked into
`CloudflareBucketProvider`, which uses it verbatim as the S3 `Bucket` on every `PutObject`,
`GetObject`, `DeleteObject`, and presigned-URL command. `vb-express`'s own `/api/storage/*` proxy
(`toParams`) forwards the entire incoming query string verbatim, including `bucketName`, adding no
restriction of its own. The only gate is that the caller's API key carries the `storage` service
scope (`registerService(app, '/api/storage', VB_EXPRESS_SERVICE.STORAGE, …)`) — but the
`legacy-shared` key that `hearth` and other apps use is seeded with **every** service scope
(`apps/api/vb-express/src/libs/api-key-seed.ts`, `buildServicePermissions(Object.values(VB_EXPRESS_SERVICE))`),
so in practice any caller holding that one shared key can request presigned upload/download URLs, or
read/delete directly (`GET`/`DELETE /:fileName`), against _any_ bucket the R2 account credentials can
reach — `home-docs`, `where-is`, `vigilant-broccoli`, `storage-buckets`, `vibecheck-bucket` — not just
the bucket the calling app is meant to use. This isn't newly introduced code (`bucket-service` and its
missing allowlist predate this window, per `22f0da319`), but #488/#492 are what newly routed hearth's
private household documents and photos — the most sensitive data behind this service to date — through
it, materially raising what a leak or misuse of the shared key now exposes.

Suggested fix: have `vb-express`'s `/api/storage/*` proxy pin `bucketName` per registered caller
instead of forwarding it from the request, or have `bucket-service` validate `bucketName` against a
declared allowlist per API key.

## B2 — Unescaped employee name in a shell command in the new birthday-sync Calendar target (Medium, open)

- Introduced: `6e5f37ca2` — _feat(employee-handler): Add a generic multi-target birthday-sync engine, plus a Google Calendar target._ (#481, 2026-08-18)
- Files: `libs/@vigilant-broccoli/employee-handler/src/employee-handler/birthday-sync/google-calendar-birthday-target.ts:27-30`, `libs/@vigilant-broccoli/google-workspace/src/google-workspace/gam.api.ts:54-85`

`eventTitle` builds a calendar event summary as `` `🎂 ${birthday.employee.firstName} ${birthday.employee.lastName} ...` ``
and passes it to `GamCommand.createRecurringCalendarEvent` / `updateCalendarEvent`, which interpolate
it unescaped into `summary "${name}"` inside a full shell command string. That string is executed
via `ShellUtils.runShellCommand` (`libs/@vigilant-broccoli/common-node/src/lib/shell/shell.utils.ts:12`),
which calls `spawn(cmd, { shell: true, ... })` — a real shell, not an argv array. A `firstName` or
`lastName` containing a `"` breaks out of the quoted argument, and shell metacharacters after it
(`` ` ``, `$()`, `;`) execute with the privileges of whatever process runs the sync (holds the `gam`
Google Workspace admin credentials). The unsafe-interpolation pattern in `gam.api.ts` predates this
window, but this is the first target that pipes employee-supplied name fields, rather than
admin-entered config, into it.

Not yet reachable in production: `createGoogleCalendarBirthdayTarget` has no wired-up caller yet, and
`fetchBirthdays`'s concrete data source isn't in this diff, so exploitability depends on whether
whatever eventually feeds it lets an employee influence their own displayed name (e.g. a
self-service HR profile). Worth fixing before a concrete consumer is wired up.

Suggested fix: build `gam` commands as argv arrays passed to a non-shell spawn, or at minimum escape
embedded `"` and shell metacharacters in `name` before interpolation.

---

## Follow-up — 2026-08-19 → 2026-08-23

Third pass covering the 29 non-Upptime commits landed since the review above. None of them touch
the files behind A3–A8 or B1–B2, so those statuses stand unchanged. One new finding below.

## C1 — Vercel env-var prune deletes a live secret whenever its Vault fetch fails (Medium, open)

- Introduced: `0a50c69d5` — _chore(deploy-vercel): Prune stale Vercel env vars during sync._ (#497, 2026-08-19)
- File: `projects/nx-workspace/scripts/deploy-vercel.ts` (`main`, `pruneStaleVercelEnvVars`)

This deploy path is used by every `nx run <app>:deploy:production` target for `hearth`, `findme`,
`whiteboard`, `employee-handler-ui` and (as of `ec3b4c6b7` in this same window) `vb-manager-next-mobile`.
`main` builds `allSecrets` from `hardcodedSecrets` plus whatever `fetchSecretsFromVault()` returns for
`keysFromVault`; a key that Vault fails to return is skipped with a `console.warn` and never added to
`allSecrets`. That same `Object.keys(allSecrets)` is then passed as `expectedKeys` to
`pruneStaleVercelEnvVars`, which deletes (via `vercelEnvRemove`) every currently-set Vercel env var
_not_ in that set — including a key that is only missing because this run's Vault fetch failed, not
because it was actually removed from `.env*.example`. The subsequent `vercelEnvAdd` pass never restores
it either, since it only iterates `allSecrets`.

Net effect: a transient Vault outage, network blip, or a secret being briefly unavailable during a
Vault-side rotation, coinciding with a production deploy, silently deletes that secret from the live
Vercel project — with only a buried `console.warn` in the deploy log as a trace, no error, no failed
exit code, and no automatic recovery until a later deploy happens to run while Vault is healthy again.
Depending on which key is lost (e.g. an OAuth client secret or an LLM API key sourced from Vault
rather than `hardcodedSecrets`), this can break login or a core feature in production with no paging
signal.

Suggested fix: fail the deploy (or at least skip pruning) when any `keysFromVault` entry comes back
empty, rather than treating a fetch failure the same as an intentional removal.

---

---

## Follow-up — 2026-08-23 → 2026-09-08 and back-fill to 2026-06-08

Fifth pass. Covers the 47 non-Upptime commits landed since the review above, plus a back-fill of the
297 landed 2026-06-08 → 2026-07-14 now that the window is a rolling three months.

## D1 — Supabase Realtime rooms are public channels, so CRDT sync bypasses the RLS on the same data (High, open)

- Introduced: `f5df720a4` — _feat: Implement whiteboard._ (2026-07-04, back-fill window) established
  the room; `e13ad2a27` — _feat(react-lib): Sync the notepad live across devices via a shared Yjs CRDT
  room_ (#518, 2026-08-23) moved the notepad onto it; `c1828361a` — _feat(hearth): Switch the shared
  notepad to the Yjs CRDT room used by vb-manager-next._ (#529, 2026-08-24) made it multi-tenant.
- Files: `libs/@vigilant-broccoli/react-lib/src/whiteboard/useWhiteboardRoom.ts:143`,
  `.../useCursorPresence.ts:72`, `.../hooks/useNotepad.ts:14`,
  `apps/hearth/src/app/hooks/use-whiteboard.ts:44`

Both room hooks open their channel as
`supabase.channel(channelName, { config: { presence: {...}, broadcast: { self: false } } })` — with no
`private: true`. Supabase channels are public unless explicitly declared private, and authorization
for private channels is enforced by RLS on `realtime.messages`; a repo-wide grep finds no
`realtime.messages` policy and no `private: true` on any channel. So any client holding the
publishable/anon key — which ships in every browser bundle — can join a channel by name and both
receive and send broadcasts.

Channel names are guessable by construction. hearth builds
`whiteboard-room-<homeId>-<boardKey>` where `homes.id` is a sequential `serial` and `boardKey` has a
default; `vb-manager-next` uses the single fixed name `notepad-room`. hearth has open self-serve
signup, so "any client" includes anyone who registers.

The persisted rows are properly RLS-gated — that is not the gap. The gap is that the live channel
carrying the same content is not gated at all, so the CRDT sync path reads around the table policy.
That matters most for the notepad: `5a0df5811` (#489, 2026-08-18) deliberately closed anonymous
notepad reads via PostgREST, and `e13ad2a27` reopened an unauthenticated read path to the same
content five days later over Realtime.

Reads are direct. Writes are indirect but real: a broadcast lands in every connected peer's editor,
and a legitimate member's client then persists it through the authenticated CAS write.

Worth noting what this is _not_: hearth passes its own per-home `channelName`, so it does not share
`vb-manager-next`'s `notepad-room` despite the commit title. Cross-app leakage via a shared room was
checked for and is not present — the issue is that neither room is authorized.

Suggested fix: set `private: true` on both channels, call `supabase.realtime.setAuth(accessToken)`,
and add `realtime.messages` policies authorizing each topic — `notepad-room` to the allowed account
(mirroring `20260818000000_restrict_notepad_and_event_calendars_read_access.sql`), and
`whiteboard-room-<homeId>-<boardKey>` via `is_home_member`/`is_home_owner` parsed from
`realtime.topic()`. Tracked as `24be3b` in `TODO.md`.

## D2 — `GET /api/homes/[id]/members` discloses the home owner's email with no authentication (High, open)

- Introduced: `0f4509fe2` — _chore: rename next-demo->hearth_ (2026-06-28)
- File: `apps/hearth/src/app/api/homes/[id]/members/route.ts:42-90`

Promoted from "pre-existing" now that the window reaches back to 2026-06-08.

The member list itself is RLS-scoped through `createServerClient(accessToken)`, but the owner entry
beside it is fetched with `createAdminClient()` — the service-role key, which bypasses RLS — and then
`admin.auth.admin.getUserById(home.user_id)`, with no authentication check and no membership check on
`id` before either call. `homes.id` is a sequential `serial`, so walking it enumerates the owner email
of every home in the database. An unauthenticated request still reaches both admin calls; the empty
`members` array from the RLS-scoped half is the only thing that degrades.

This is adjacent to `e9d272` (fixed in #547) but not covered by it: that fix corrected the
`home_members` RLS policy, whereas this path deliberately bypasses RLS with the service-role client.

Suggested fix: resolve the caller first and return 401 when absent, then gate the owner lookup on
`is_home_owner(id) or is_home_member(id)` before touching `createAdminClient()`.

## D3 — `manual-deploy-app.yml` interpolates a dispatch input into a `run:` block (Low, open)

- Introduced: `e2097bdd9` — _infrastructure: CI and infra enhancements._ (2026-07-03)
- File: `.github/workflows/manual-deploy-app.yml:95,98`

Promoted from "pre-existing" for the same reason as D2.

`${{ github.event.inputs.project }}` and `${{ github.event.inputs.environment }}` are expanded
directly into the shell of a `run:` block rather than passed through `env:`, so a crafted input is
substituted into the script before the shell parses it. Exploitable only by someone who already holds
write access — hence Low — but it is the one remaining template-injection site in the workflow set,
and `manual-agentic-solve.yml` already demonstrates the correct pattern (all inputs via `env:`, plus
a hex-pattern validation on `ids`).

Suggested fix: pass both inputs through `env:` and reference them as `"$PROJECT"` / `"$ENVIRONMENT"`.

---

## Re-verification — 2026-09-08

Every open finding was re-checked against `main` at 2026-09-08. None have been fixed or partially
mitigated; each line below is the evidence that the original condition still holds.

| ID  | Still open | Evidence on `main` at 2026-09-08                                                                                                                                                                                                 |
| --- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A3  | Yes        | `PRIVATE_HOSTNAME_SUFFIXES` is still `['.local', '.internal']` (`recipe.ts:29`) — no `.flycast`, no redirect re-validation, no DNS check                                                                                         |
| A4  | Yes        | `createImageUploadUrl` still signs only key + mimeType (`where-is/r2.ts:77`); size still checked post-storage (`:94`); still no R2 lifecycle rule for the staging prefix — only `nx-cache` has one (`cloudflare-nx-cache.tf:22`) |
| A5  | Yes        | `exception when others then return new` still present (`20260812000026_harden_accept_invites_trigger.sql:12`)                                                                                                                    |
| A6  | Yes        | `z.array(z.string().min(1)).min(1)` still has no `.max()` (`extract-ingredients/route.ts:96`; `chat/route.ts:68,73`)                                                                                                             |
| A7  | Yes        | Parser still drops short rows via `if (cells.length >= 4)` (`todo-markdown.utils.ts:93`)                                                                                                                                         |
| A8  | Yes        | Still `?.replace(BEARER_PREFIX, '')` (`apps/hearth/libs/supabase-server.ts:8`)                                                                                                                                                   |
| B1  | Yes        | `resolveBucketName` still returns the caller's value with no allowlist (`bucket-service/src/routes/bucket.ts:64-69`), used by 8 call sites                                                                                       |
| B2  | Yes        | `summary "${name}"` still interpolated into a shell string (`gam.api.ts:28,51,72`) run via `spawn(cmd, { shell: true })` (`shell.utils.ts:13`)                                                                                   |
| C1  | Yes        | A failed Vault fetch still only `console.warn`s and skips the key (`deploy-vercel.ts:311`), and that same `allSecrets` is still the prune set (`:336`)                                                                           |

A1 and A2 remain fixed; nothing in this window regressed them.

## Pre-existing issues noticed en route (outside the audit window)

Recorded for completeness — these were not introduced by the commits under review. The two hearth/CI
entries previously listed here became D2 and D3 once the window widened.

- **The agent sandbox's default-deny egress firewall allows the entire host `/24`** and unrestricted
  UDP/TCP port 53 (`infrastructure/agent-sandbox/init-firewall.sh:26,32-33`), so a sandboxed agent can
  reach the whole local LAN and has a DNS exfiltration channel.

## Checked and found sound

Noting these so a future pass does not re-litigate them:

- `LocalBucketProvider.resolveContainedPath` correctly contains `../` traversal, so the
  `bucket-service` `GET|DELETE /:fileName` routes are safe for the local provider.
- The `nx-cache` Cloudflare Worker enforces immutable writes via `onlyIf: { etagDoesNotMatch: '*' }`,
  compares tokens in constant time, and hands out no R2 credential; `ci-pr-check.yml` gets
  `NX_CACHE_READ_TOKEN` while only `deploy.yml` (main-only) gets the write token.
- `eae0a8172` correctly routes API-key and socket-token comparison through
  `isTimingSafeEqual`, including the length guard `timingSafeEqual` needs.
- `manual-agentic-solve.yml` passes all `workflow_dispatch` inputs via `env:`, validates `ids`
  against a hex pattern, and `solve-todo.sh` registers the runtime-minted GitHub App token with
  `::add-mask::` before CI tees the per-id logs.
- Every API route in `vb-manager-next-mobile` goes through `requireAuth`, which enforces
  `isAllowedEmail` before the service-role client is touched.
- `MarkdownViewer` and `ChecklistViewer` both run `DOMPurify.sanitize` before
  `dangerouslySetInnerHTML`.
- The new `grocery_items`, `kitchen_chore_items` and `whiteboards` tables all enable RLS with
  home-membership policies; `google_oauth_tokens` enables RLS with no policies so the publishable key
  can never read refresh tokens.
- `employee-handler-ui`'s new `/api/config` route (`1a9b8e6ef`, #514) returns only the Supabase URL
  and publishable/anon key — the same class of value already treated as client-exposable elsewhere in
  this repo — and `proxy.ts`'s bypass is scoped to that one path; every other `/api/*` route still
  requires a valid Bearer token.
- `vb-manager-next`'s new `/api/terraform/status` route (`bfd0e66d6`, #509) reads the local
  `~/.terraform.d/credentials.tfrc.json` token server-side to report login state and account
  email/username, but never returns the token itself, and the route sits behind the app-wide
  `proxy.ts` Supabase auth gate like every other `/api/*` route in this app (no open self-serve
  signup here, unlike hearth).
- The new `aws-immich.tf` (`8814205937`, #513) opens no inbound 80/443 — Immich is reachable only via
  an outbound-only Cloudflare Tunnel gated by a `cloudflare_zero_trust_access_policy` allow-listing a
  single email — matching the existing `vault.harryliu.dev` pattern rather than a direct A-record.
- Despite its title, `c1828361a` (#529) does **not** put hearth on `vb-manager-next`'s `notepad-room`:
  hearth passes its own `whiteboard-room-<homeId>-<boardKey>` channel, so there is no cross-app room
  sharing between a single-user app and one with open signup. The rooms are unauthorized (D1), but
  they are at least separate.
- `c5f23560e` (#557) removes `journal.harryliu.dev` outright — the Pages project, the hourly
  `cron-deploy-journal` workflow, and the Cloudflare domain/DNS/Access resources. This is a net
  reduction in exposure: the private notes archive no longer lands in plaintext on a GitHub-hosted
  runner or in Cloudflare Pages storage, leaving Gitea on the VM as the single copy. It also retired
  `TODO.md` row `b848da`, which had proposed self-hosting the same site.
- `420ca6bec` (#547) fixes the `home_members` RLS hole (`e9d272`): the `FOR ALL` policy with no
  `WITH CHECK` is replaced by a SELECT policy plus a narrow UPDATE policy, with a `BEFORE UPDATE`
  trigger pinning the other columns. The trigger defers to callers with no JWT, which is what keeps
  the service-role paths in the members API working; see D2 for the separate, still-open issue on that
  same route.
- `c5ce838a2` (#554) moves the code-server toolchain into a derived image pinned to the upstream
  multi-arch index digest rather than `:latest`, so a rebuild cannot silently pick up a new
  code-server. The VM pulls that image anonymously, so the Docker Hub repo must stay public — an
  availability dependency, not a confidentiality one, since the image carries no secrets.
