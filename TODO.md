# Repo Audit — Outstanding Issues

## P1

### 009c6e. [security] CI GitHub Actions service account is massively overprivileged

**`infrastructure/terraform/main.tf:250-274`**

The WIF-federated `github-actions` SA that every workflow can impersonate holds project `roles/editor`, `roles/iam.serviceAccountAdmin`, `roles/iam.workloadIdentityPoolAdmin`, and project-level `roles/secretmanager.secretAccessor`. A single compromised workflow run can read almost every secret (Vault root token, WG server key, unseal keys), rewrite the Workload Identity Pool for persistence, and take full project control.

**Fix:** Terraform applies run locally, so CI does not need editor/SA-admin/pool-admin — remove all three. Replace the project-level `secretAccessor` with per-secret `google_secret_manager_secret_iam_member` grants for only the secrets workflows actually read (per `cloudflare-vault.tf`, the CF Access token pair + tunnel token).

### 032af1. [performance] bucket-service buffers entire uploads/downloads in memory, no multipart limits, on a 256MB VM

**`projects/nx-workspace/apps/api/bucket-service/src/routes/bucket.ts`** (upload collects `await part.toBuffer()` for every part before uploading; GET reads the whole object then `reply.send(buffer)`) · `src/main.ts:42` registers `@fastify/multipart` with no `limits` · providers in `libs/@vigilant-broccoli/storage/src/lib/bucket/providers/*` all materialize whole objects.

Peak memory ≈ sum of all file sizes, on a `memory = '256mb'` fly machine — a single ~150MB file in either direction OOMs it.

**Fix:** register multipart with `limits: { fileSize, files }`; stream each part to the provider as it arrives (`Upload` from `@aws-sdk/lib-storage`, `file.createWriteStream()` for GCS, `pipeline(part.file, ...)` for local); for GET return the provider stream via `reply.send(stream)`.

### 076146. [performance] RabbitMQ consumers hot-requeue poison messages forever (queue wedge + Resend hammering)

**`projects/nx-workspace/apps/api/email-service/src/main.ts:91`** · same pattern in `email-subscription-service/src/main.ts:139`

On any handler error the consumer does `channel.nack(msg, false, true)` with `prefetch(1)`. A permanently-failing message (malformed JSON, Resend 4xx) is redelivered immediately and infinitely: a tight CPU loop on a 256MB machine that hammers the Resend API and head-of-line blocks every other email indefinitely.

**Fix:** on failure `nack(msg, false, false)` into a dead-letter queue, or republish with an `x-retry` count header and reject after N attempts (optionally with delay).

### 0d1d8a. [performance] hearth renders a blank screen until a client-side session round-trip; entire app is CSR

**`projects/nx-workspace/apps/hearth/src/app/providers/auth-provider.tsx:34`** — `if (session === undefined) return null;`

AuthProvider wraps the whole app in `layout.tsx`, so every page (including `/login`) paints blank until `supabase.auth.getSession()` resolves in the browser; all 31 `page.tsx` files are `'use client'`. First load is a 4-hop waterfall: bundle → `getSession()` → HomeProvider queries (themselves sequential, see 769a1e) → per-page fetch gated on `selectedHomeId`.

**Fix:** render the shell immediately (skeletons instead of `return null`); let public routes render unconditionally. Longer term, adopt `@supabase/ssr` cookie sessions so server components can fetch data, or at least start the homes fetch in parallel with session resolution.

### 16dbe5. [performance] code-server VM re-provisions its entire toolchain (~1GB+) on every container (re)start

**`infrastructure/terraform/cloud-init-code-server.yaml:27-66`** (init script), `:72` (`:latest`)

The `/custom-cont-init.d` script runs at every container start: `apt-get update/install` runs unconditionally, and the `command -v`-guarded blocks (Node, ~700MB `google-cloud-cli`, claude-code) only survive while the same image filesystem is alive. Watchtower no longer auto-updates `linuxserver/code-server:latest` (removed in 2ca4a3), but any deliberate redeploy — `terraform apply` (VM recreation) or a manual `docker compose pull && up -d` — still discards the toolchain layer: 1GB+ of downloads and minutes of apt/npm before code-server can start.

**Fix:** bake a derived image (`FROM lscr.io/linuxserver/code-server` + toolchain in a Dockerfile), push to Docker Hub, and reference it here. Cheaper fallback: install the toolchain under the persistent `/config` volume (or gate the script on a `/config` marker file) and pin the image tag.

## P2

### 17daeb. [security] GCP VMs on `default` network; default-allow-ssh likely open on the Vault VM

**`infrastructure/terraform/main.tf:96-127`**

Only WireGuard-UDP and IAP-SSH firewall rules are defined on the `default` network; nothing deletes GCP's auto-created `default-allow-ssh` (tcp/22 from 0.0.0.0/0). The IAP-only rule is additive, so port 22 on the Vault VM is probably internet-open, defeating the IAP-only design. **Fix:** dedicated VPC with explicit rules only, or delete/manage `default-allow-ssh` in Terraform so the repo is the source of truth.

### 1a2b1b. [security] Default compute SA has project-wide secret access + `cloud-platform` scope

**`infrastructure/terraform/main.tf:103-104`** (scopes) + project-level secretAccessor grants

Every VM (including transient Packer build VMs) using the default SA can read all project secrets and use the Vault KMS unseal key — any RCE on the box yields Vault root token + WG private key + Bitwarden password. **Fix:** dedicated SA for `vb-free-vm` with per-secret grants (needs only `VB_VM_WG_*`, `VB_VM_CLOUDFLARED_TUNNEL_TOKEN`) + the KMS key; run Packer with a separate minimal SA.

### 16fb17. [security] Seafile's two EBS volumes are unencrypted at rest

**`infrastructure/terraform/aws-seafile.tf:67-79`** (`aws_ebs_volume.seafile_data`) + `:96-99` (`aws_instance.seafile`'s `root_block_device`)

Confirmed via `terraform state show`: both volumes have `encrypted = false`, and account-level default EBS encryption is off in this region. `seafile_data` (added for persistent storage independent of instance replacement) holds every user file plus the full MariaDB database — admin password hash, per-share tokens, everything — all unencrypted on disk. **Fix:** add `encrypted = true` to both the `aws_ebs_volume.seafile_data` resource and the `root_block_device` block. `encrypted` is a ForceNew attribute on `aws_ebs_volume`, so this forces a volume replacement — repeat the same live-migration procedure used to introduce `seafile_data` (targeted apply for a fresh encrypted volume, copy data over via a verified backup, swap the bind mounts, restart) rather than a plain `terraform apply`, to avoid the same `-target`-pulls-in-dependencies trap that replaced the instance early last time. Schedule for a deliberate maintenance window, not opportunistically.

### 20177f. [security] RabbitMQ management UI + SSH exposed to 0.0.0.0/0; user is `admin`

**`infrastructure/terraform/oci.tf:49-90`**

The management UI (TLS but single-factor, username `admin`) is internet-reachable — continuous credential-stuffing surface. SSH/22 is world-open on all three OCI VMs. **Fix:** restrict 15671 and 22 to home/WG egress IPs. (5671 AMQPS must stay open for fly.io consumers — justified.)

### ff4327. [security] Seafile SSH open to 0.0.0.0/0, no brute-force mitigation

**`infrastructure/terraform/aws-seafile.tf:20-25`** (`aws_security_group.seafile` ingress) — the security group's own `description` (`:18`) documents this as an intentional tradeoff ("SSH open, 80/443 restricted to Cloudflare..."), and it's mitigated by key-only auth (Ubuntu's cloud image disables SSH password auth by default). No `fail2ban` or connection-rate limiting is configured, so the box is a continuous target for opportunistic scanning/brute-force attempts, all of which fail without a valid key but still consume log volume and a nonzero CPU/attack-surface cost. Likely an acceptable risk for a single-admin personal server (compare `20177f`'s equivalent finding for the OCI VMs, same tradeoff). **Fix (if ever prioritized):** restrict the `cidr_blocks` on the port-22 ingress rule to a known home/WireGuard egress IP (matching `20177f`'s suggested fix for the OCI boxes), or add `fail2ban` via cloud-init.

### 21290b. [security] Vault root token used as everyday credential + passed on command lines

**`infrastructure/terraform/main.tf`** (`VB_VM_VAULT_ROOT_TOKEN` secret) · `packer/scripts/run-vault-*.sh`, `rotate-*.sh`, `scripts/post-apply.sh:119-122`

The never-expiring root token is the routine operational credential and is interpolated into `gcloud compute ssh --command="… VAULT_TOKEN='…' …"` strings (visible in `ps` on the VM); unseal keys likewise passed as CLI args. **Fix:** scoped admin policy + short-TTL token role for scripts; revoke the root token (keep recovery keys); pass secrets via stdin — `sync-socket-server-token.sh` already does the stdin pattern correctly, copy it.

### 229043. [security] No rate limiting on LLM/chat endpoints (cost abuse)

**`projects/nx-workspace/apps/api/llm-service/src/routes/llm.ts`**, `chat.ts`

PR #115 clamped `numOutputs` (`MAX_NUM_OUTPUTS`), but the remaining exposure stands: no `@fastify/rate-limit` anywhere (vb-express sets `rateLimit: { enabled: false }`), and no input token-size cap — a caller with the shared token can still fire unlimited paid model calls. **Fix:** add per-key/IP rate limiting on LLM + chat routes and cap input size.

### 240ff8. [security] Open email relay to arbitrary recipients from a trusted domain

**`projects/nx-workspace/apps/api/email-service/src/main.ts:135-171`**

`/api/send-email` and `/api/queue-emails` validate only that `to`/`subject` exist; `to`, `html`/`text`, and `from` are fully caller-controlled and sent via Resend from verified `harryliu.dev`. Whoever holds `SHARED_APP_TOKEN` can send unlimited arbitrary mail from a trusted domain — a spam/phishing relay that also risks domain reputation. **Fix:** allowlist `to`/`from`, cap batch size, add rate limiting, treat the send token as more sensitive.

### 27b216. [security] Open room subscription on socket server (message eavesdropping)

**`projects/nx-workspace/apps/socket-server-socketio/src/main.ts`** (`handleSubscribe`; `cors: { origin: '*' }`)

Publishing is gated by `SENDER_TOKEN`, but subscribing is completely open: any anonymous client can `subscribe` to any `roomFor(app, receiverId)` with no ownership check. Guess/know a `receiverId` → receive every message to that receiver. **Fix:** authenticate receivers and authorize ownership of `receiverId` before `socket.join`. Related hardening tracked in 9cbd33.

### 282218. [security] SMS send relay with caller-controlled from/to/body (toll fraud)

**`projects/nx-workspace/apps/api/vb-express/src/routes/messaging.ts`** (`/send-text-message`)

`body`/`from`/`to` pass straight to `Twilio.messages.create` with no allowlist and no rate limit. A leaked messaging key → SMS to arbitrary premium/international numbers on the owner's account. **Fix:** restrict `from` to owned numbers, allowlist/validate `to`, rate-limit.

### 2a641b. [security] hearth: R2 bucket world-readable; private documents served from a public URL

**`projects/nx-workspace/apps/hearth/src/app/config.ts`** (`R2_PUBLIC_URL = https://pub-….r2.dev`), `src/app/api/docs/r2.ts`

Home docs (leases, insurance, warranties) are served from the public r2.dev URL. Keys embed random UUIDs (not enumerable), but there's no authorization and no expiry on reads — anyone with a URL can fetch a private PDF indefinitely, even after leaving the home. **Fix:** make the bucket private; serve through an authenticated route that checks home membership and returns a short-lived presigned URL.

### 306cc4. [security] Single shared Vault role gives every workflow the whole secret store

**`infrastructure/terraform/packer/scripts/run-vault-post-init.sh`** (policy grants `kv/data/secrets/*`) · consumed by `.github/actions/vault-secrets/action.yml`

Role `github-actions-role` is usable by any job with `id-token: write` — including low-stakes smoke tests. The `secrets:` filter in the composite action is cosmetic; a compromised step can mint its own OIDC token and dump the whole KV path. **Fix:** per-purpose Vault roles bound with `bound_claims.job_workflow_ref` (the rotate role in the same script already shows the pattern) exposing only the keys each workflow needs.

**Partially addressed** for `ci-pr-check.yml`: the nx-cache remote-cache PR gave it its own `github-actions-pr-check-role` (policy scoped to `kv/data/ci-pr-check` only) plus its own minimally-scoped GCP service account/WIF provider — that was the urgent instance, since `pull_request` (unlike every other trigger here) runs the workflow YAML from the PR branch itself, reachable by outside contributors. Still open: `deploy.yml` and `notify-start` (push-triggered, higher trust bar, but still share the broad `github-actions-role` + `github_actions` GCP SA that also carries `roles/editor`/`serviceAccountAdmin`/project-wide `secretAccessor`) haven't been narrowed — a compromised dependency in either would still reach the whole store.

### 331697. [security] SSH host-key verification effectively disabled when pushing `SHARED_APP_TOKEN`

**`infrastructure/terraform/packer/scripts/sync-socket-server-token.sh:61-63`** (via `ci-rotate-secrets.yml`)

`StrictHostKeyChecking=accept-new` plus `ssh-keygen -R` before connecting = trust-on-first-use every run, then the rotated `SHARED_APP_TOKEN` is piped over that connection. DNS hijack / MITM of `socket.harryliu.dev` presents its own host key, is accepted, and receives the new token. Same TOFU pattern in `cron-backup.yml:79,85` (lower impact). **Fix:** store the VMs' host public keys (not secret) in repo/Vault, write to `known_hosts` with `StrictHostKeyChecking=yes`, drop the `ssh-keygen -R`.

### 427e54. [performance] Follower jobs fire after every deploy — even no-op deploys

Thirteen workflows trigger on `workflow_run` (health-check, notify-complete, e2e suites incl. the 5-provider paid-token `test-e2e-llm` matrix, security suites, smoke) — roughly 25 jobs, most doing their own checkout + OIDC + Secret Manager + Vault round trip. `deploy` succeeds even when `has_deployments=false` (`deploy.yml:140-153`), so a push touching nothing deployable still triggers the full fan-out against production; it also double-fires via `ci-rotate-secrets` calling deploy. **Fix:** expose what was actually deployed (job output → `repository_dispatch` per service or an artifact followers check) and exit early otherwise; drop the cron+per-deploy duplication on the `test-security-*` suites.

### 45c377. [performance] `cron-deploy-journal` rebuilds and redeploys hourly, unconditionally

**`.github/workflows/cron-deploy-journal.yml`** — 24×/day: full checkout, pnpm install of the workspace, Vault round trip, Gitea archive download, build (`--skip-nx-cache`!), Cloudflare Pages deploy — even when the journal hasn't changed. The largest recurring CI consumer in the repo (~24 × 3–5 min/day). **Fix:** query the Gitea API for the journal repo's HEAD sha first and compare with the last-deployed sha (stored in GCS/a Pages deployment message/a repo variable); exit early when unchanged.

### 47b3fb. [performance] Queue consumers live inside auto-stopped fly machines — email delivery stalls while stopped

Both email services start their AMQP consumer in the web process but run with `auto_stop_machines = 'stop'`, `min_machines_running = 0` (`deployment-configs/fly-configs/{production,staging}-email-service.toml` and email-subscription tomls). Outbound AMQP doesn't keep fly machines alive: when stopped, queued emails sit until an HTTP request (in practice the Upptime ping) wakes the machine — minutes of delivery delay plus RabbitMQ reconnect churn per cycle. **Fix:** `min_machines_running = 1` for email-service, or move consumers to the always-on VM, or accept and document the delay.

### 496949. [performance] Upptime pings + auto-stop = machines cycle start/stop near-continuously

`.upptimerc.yml` `sites:` includes all the fly apps (staging + production); each check wakes a stopped machine, fly's idle sweep stops it minutes later. Net: a large fraction of always-on runtime is paid anyway, real users still frequently hit cold starts (vb-express runs better-auth migrations at boot), and every cycle re-handshakes RabbitMQ/Supabase. **Fix (pick one per service):** `min_machines_running = 1` for user-facing vb-express, or `auto_stop_machines = 'suspend'` (resume ~sub-second vs full boot), or lengthen the Upptime interval.

### 4eb262. [performance] Service-to-service calls go over the public fly edge instead of private networking

**`deployment-configs/fly-configs/production-vb-express.toml:9-10`** (and staging) — `EMAIL_SERVICE_URL`/`LLM_SERVICE_URL` are `https://*.fly.dev`. Every vb-express→llm-service call exits through the fly edge, TLS, and back in; multi-MB base64 image payloads get re-sent over that hop, and chained cold starts stack (a cold vb-express request needing llm-service pays two sequential boots). **Fix:** `http://<app>.flycast` (keeps auto-start) — no public egress/TLS/edge hop.

### 5b34e7. [performance] `googleapis` meta-package import — heavy cold-start cost in vb-express

**`apps/api/vb-express/src/routes/tasks.ts:2`** — `import { google } from 'googleapis'` indexes every Google API at require time on a shared-1-cpu machine that cold-boots constantly (496949), and drags a huge tree into the pruned image. **Fix:** `@googleapis/tasks` only, or plain `fetch` against the REST API (the code already does this for task lists).

### 5b720a. [performance] llm-service streaming doesn't abort upstream on client disconnect

**`apps/api/llm-service/src/routes/chat.ts`** — after `reply.hijack()`, the `for await` loop has no `close` listener on the raw socket; when the user closes the tab mid-generation, the OpenAI stream is consumed (and billed) to completion. **Fix:** pass an `AbortController.signal` to the SDK call and abort from `reply.raw.on('close', ...)`.

### 69d76a. [performance] Whiteboard broadcasts the full document on every keystroke

**`libs/@vigilant-broccoli/react-lib/src/whiteboard/useWhiteboardRoom.ts:161-172`** — `setContent` sends the entire content string per `onChange`, no debounce; typing at 60 WPM in a large doc ≈ 5 full-payload Supabase realtime messages/sec per participant, every peer re-rendering per message. **Fix:** throttle/debounce sends (~200ms trailing) while updating local state immediately; optionally send diffs.

### 6b3c12. [performance] No route-level code splitting in any SPA

Zero `lazy(` hits across `apps/ui`, `apps/findme`, `apps/whiteboard`; `cloud-8-skate-angular` eagerly imports every page in `routes.const.ts` (no `loadComponent`). Concretely: `personal-website-react/src/app/app.tsx` statically imports all 9 pages, so `marked` ships in the initial chunk for home-page visitors. **Fix:** `React.lazy` + `Suspense` for heavy routes; `loadComponent` for Angular.

### 6fc308. [performance] vb-manager root layout is `'use client'` with a hidden always-mounted dialog tree

**`apps/ui/vb-manager-next/src/app/layout.tsx:1`** + `(pages)/layout.tsx` mounting `FloatingIslandComponent` inside `display: none` on every page — including the chatbot dialog which statically imports `react-markdown`, plus email/calendar/weather/pomodoro dialogs, all in the shared layout bundle executing on first paint. **Fix:** `next/dynamic` for each dialog (needed only after a shortcut/click); move `'use client'` down from the root layout so pages can opt into server rendering later.

### 70c513. [performance] hearth where-is: base64-in-JSON uploads buffered whole; 50MB cap unreachable on Vercel

**`apps/hearth/src/app/api/where-is/route.ts:17`** (`MAX_REQUEST_BYTES = 50MB`) — base64 inflates ~33% and Vercel serverless caps bodies at ~4.5MB, so multi-photo uploads fail long before the app-level limit, and successful ones hold payload + decoded buffers + sharp outputs in one lambda's memory. Same pattern in `api/docs/route.ts:14` (100MB cap). **Fix:** presigned R2 PUT URLs (one small minting route) + metadata-only POST; or at least multipart streaming.

### 769a1e. [performance] hearth HomeProvider: sequential independent queries on every page's critical path

**`apps/hearth/src/app/providers/home-provider.tsx:35-44`** — `owned` homes then `memberships` awaited sequentially; every page's data fetch is gated on `selectedHomeId`, so this adds a full extra round trip to first content on every cold load. **Fix:** `Promise.all`; consider caching last `selectedHomeId` in `localStorage` to skip the gate for returning users.

### 7ce463. [performance] hearth calendar fetches the entire event history on every view

**`apps/hearth/src/app/api/calendar/events/route.ts:42-44`** — `select('*')` on `calendar_events` with no date-range filter; grows unboundedly. **Fix:** accept `start`/`end` params (FullCalendar provides the visible range) and filter with `.gte/.lte`.

### 7e1071. [performance] hearth ships zero optimized images; 1920px originals rendered as 96px thumbnails

No `next/image` anywhere in hearth; R2 originals stored at up to 1920px/q85 (`api/where-is/image-processor.ts`) render via plain `<img>` at `h-24 w-24` in lists. A storage area with 10 photos downloads several MB to show thumbnails. **Fix:** write a second ~256px `-thumb.jpg` variant at upload (sharp is already in the pipeline) and use it in lists; or route R2 URLs through `next/image` `remotePatterns`.

### 7f6d01. [performance] vb-manager docs search re-reads the whole notes tree and builds two Fuse indexes per keystroke

**`apps/ui/vb-manager-next/src/app/api/docs/search/route.ts:103`** — `getAllMarkdownFiles()` recursively reads every `.md` under `~/vigilant-broccoli/notes` and constructs Fuse instances on each request; the 300ms client debounce still yields several full-tree reads per typed query. **Fix:** cache the corpus + indexes in module scope with an mtime/TTL check.

### 8290e3. [performance] speed-test route: no in-flight dedupe — concurrent polls stack `speedtest` processes

**`apps/ui/vb-manager-next/src/app/api/speed-test/route.ts:19-32`** — the 5-min cache timestamp is written only after the run completes; the client polls every 30s and a run takes 20–40s, so once the cache expires every poll/tab arriving during the run launches another `speedtest`, each saturating the uplink the others are measuring. **Fix:** store the in-flight promise in module scope and await it for concurrent callers; decouple the client interval from the server cache TTL.

### 83f236. [performance] Docker daemon baked into and enabled on the 1GB e2-micro; nothing on that VM uses it

**`infrastructure/terraform/packer/scripts/provision.sh:29-32`** — Docker installed and `systemctl enable`d on the GCP free-tier VM, which runs Vault as a native binary plus WireGuard/cloudflared; nothing runs a container there. Idle dockerd+containerd ≈ 70–100MB RSS — ~10% of total RAM. **Fix:** drop the Docker install from `provision.sh` (or at least don't enable it).

### 8bc0e1. [performance] Backup bucket versioning silently multiplies retention ~13x past the intended 7 copies

**`infrastructure/terraform/main.tf:439-443`** — the backup bucket has `versioning { enabled = true }` with a 90-day age Delete rule, while `cron-backup.yml` prunes to 7 backups via `gsutil rm` — which with versioning only makes objects noncurrent. Net: ~90 daily full dumps (repo + Gitea + MongoDB + Supabase) billed, not 7. **Fix:** disable versioning (dated filenames already provide history), or add a `days_since_noncurrent_time` lifecycle rule (e.g. 7).

### 9a3554. [performance] Every `pnpm tf:*` command pays a ~5–10s Bitwarden/gcloud secrets bootstrap

**`infrastructure/terraform/scripts/load-vault-tf-env.sh:19-35`** — each invocation runs `bw status`, a network `gcloud secrets versions access`, `bw unlock`, `bw list folders`, `bw list items` — each `bw` call a ~0.5–1s Node CLI startup plus vault decryption, on every `tf:plan`/`tf:apply`/`tf:import`. **Fix:** cache `BW_SESSION` (0600 file under `$XDG_RUNTIME_DIR` or keychain) and the resolved token exports with a short TTL; re-derive only on failure.

### 9c6df0. [performance] Local `nx serve` of fly services fetches Vault token + secrets over the network on every start

**`apps/api/llm-service/project.json`** (`serve`) → `scripts/fetch-secrets.ts` → `scripts/gcp-vault-token.ts` — `gcloud secrets versions access` + a Vault read over WireGuard on every dev-server start. **Fix:** cache fetched env with a TTL (`--refresh` to force); the code already short-circuits on `VAULT_TOKEN` — document/wrap that path.

### 9cbd33. [security] Socket-server hardening

- Short-lived JWTs instead of the long-lived `SHARED_APP_TOKEN` — `route.ts` signs `{ exp: +60s }` with a `JWT_SECRET` from Vault, server middleware verifies; optional per-room scope.
- App-level: CORS allowlist via `ALLOWED_ORIGINS` env (currently `*`), payload size cap, last-message cache per room on subscribe.
- Subscribe-side authorization (any anonymous client can join any room) tracked separately in 27b216.

### 16815c. [security] `vb-manager-next`: Supabase Google sign-in has no allowlist — accepted risk (not fixed)

**`projects/nx-workspace/apps/ui/vb-manager-next/src/middleware.ts`**, `libs/server-auth.ts`

`middleware.ts` verifies the Supabase bearer token via `supabase.auth.getUser(token)` and admits any valid user — no allowed-emails check. **Any** Google user who completes the Supabase OAuth flow gets a valid session and passes the `/api/*` gate. The session is real access control, but any Google account can obtain one. (Migrated from NextAuth to Supabase auth; the missing-allowlist gap carried over unchanged. `employee-handler-ui`'s `proxy.ts` shows the allowlist pattern this could adopt.)

**Fix:** in `middleware.ts` (and `getUserEmail`), reject unless `data.user.email` is in an `ALLOWED_EMAILS` / `ALLOWED_EMAIL_DOMAINS` allowlist, mirroring `employee-handler-ui/src/proxy.ts`.

**Status:** deliberately left open. Owner's stated threat model: solo use, UI-only interaction, app bound to `127.0.0.1` (confirmed in `ecosystem.config.js` and the local nginx proxy), no external callers — the owner is the only account that will ever complete this app's Google OAuth flow, so the allowlist's marginal value is low here. Revisit if the app is ever exposed beyond loopback or a second Google account is ever expected to authenticate.

### 5bdea5. [performance] Vite/Angular bundle-size warnings

- **`component-library`**: JS chunk 676.91 kB / CSS chunk 725.17 kB, both over the 500 kB threshold. CSS cause: `src/main.tsx` imports the full `@radix-ui/themes/styles.css` (812 kB unminified, unpurgeable). JS cause: `libs/@vigilant-broccoli/react-sandbox/src/lib/ComponentSandbox.tsx` statically imports all 13 demo components + 6 utility contents at module top-level, rendered unconditionally even though only one `CollapsibleList` section is open by default — fix with `React.lazy` + `Suspense` per demo.
- **`docs-md`**: JS chunk 520.30 kB / CSS chunk 733.63 kB, over threshold. Same `@radix-ui/themes/styles.css` full import in `src/main.tsx`, used only for the `<Theme>` wrapper — fix by dropping the Radix Themes dependency here in favor of a minimal custom CSS reset (or Radix Themes' documented modular CSS imports: tokens + only needed color scales + components).
- **`journal`**: JS chunk 519.53 kB / CSS chunk 733.63 kB, over threshold. Same root cause and fix as `docs-md`. All three Vite apps additionally have no `build.rollupOptions.output.manualChunks` in `vite.config.mts` — everything (including `react`/`react-dom`/`@radix-ui/themes`) ships as one chunk; splitting vendor deps into their own chunk would help caching independent of the fixes above. (Tailwind content globs in all three are correctly scoped — confirmed not a contributing factor.)

### 1f0a7e. [maintenance] Next.js "inferred workspace root" warning

- Multiple Next.js apps (`small-business-next`, `vb-manager-next`, `vb-manager-next-mobile`, `whiteboard`, `findme`, `hearth`, `employee-handler-ui`) log "Next.js inferred your workspace root, but it may not be correct" — caused by the repo having two lockfiles (root `pnpm-lock.yaml` and `projects/nx-workspace/pnpm-lock.yaml`). Fix by setting `outputFileTracingRoot` (or `turbopack.root`) explicitly in each app's Next.js config, or removing the redundant lockfile. Deferred — CI builds pass today (warning only); revisit if a tracing-root-sensitive deploy issue surfaces, especially for `hearth` given its Vercel serverless `sharp` bundling.

### a5fb01. [security] upptime GitHub App private key has no rotation automation

The upptime crons (`.github/workflows/cron-upptime.yml`, `cron-upptime-response-time.yml`) mint per-run installation tokens from a dedicated GitHub App (App ID `4350545`, hardcoded; Contents + Issues RW only) via `infrastructure/agent-sandbox/mint-github-app-token.sh`, using `UPPTIME_GH_APP_PRIVATE_KEY` from Vault `kv/data/secrets` (base64-encoded PEM). This key is what lets a push bypass the `main` ruleset (`infrastructure/terraform/github.tf` — `Integration 4350545` bypass actor), so it's security-relevant, yet nothing rotates it. It's absent from the `rotate-secrets` workflow (`.github/workflows/ci-rotate-secrets.yml`) and from the manual rotation inventory in `docs/infrastructure/secret-management.md`. Every other GitHub App/PAT credential is at least documented as a manual rotate-at-source item (`AGENT_GH_APP_PRIVATE_KEY`, `AGENT_GITHUB_TOKEN` — secret-management.md:66-67), and the app-key case even has a working precedent: `pnpm secret-rotation:profile-deploy-key` (`scripts/ci/rotate-profile-deploy-key.sh`) already does mint → verify → `vault kv patch` → delete-predecessors for an ed25519 deploy key.

Desired end state: the key is on a rotation path — at minimum listed as a manual rotate-at-source item in secret-management.md; better, a scripted rotator following the repo's mint → verify → store → revoke pattern (`docs/infrastructure/secret-rotation-implementation.md`).

**Steps:**

1. Add `UPPTIME_GH_APP_PRIVATE_KEY` to the manual rotation inventory in `docs/infrastructure/secret-management.md` (the "Rotate at source, then `vault kv patch`" list), noting: generate a new private key on the app at https://github.com/settings/apps, `base64 -i key.pem | tr -d '\n'`, `vault kv patch kv/secrets UPPTIME_GH_APP_PRIVATE_KEY=...`, then delete the old key on the app. No redeploy needed — the crons read Vault fresh each run.
2. Optional (preferred): script it as `pnpm secret-rotation:upptime-app-key`, modeled on `rotate-profile-deploy-key.sh`. Note the constraint — GitHub has no API to _generate_ an app private key (only humans can, in the app settings UI), so a rotator can only _verify a human-supplied new key and revoke old ones_, not fully self-serve. Scope accordingly, or document it as manual-only.
3. If scripted, wire it into `pnpm secret-rotation:all` and the rotation table in `docs/infrastructure/secret-rotation-implementation.md`, matching the existing entries' columns.
4. Cross-check `docs/infrastructure/secret-management.md`'s key inventory (Deploy secrets tier) actually lists `UPPTIME_GH_APP_PRIVATE_KEY` — it was added ad hoc during the GitHub App migration and may not be in the canonical inventory yet.

### 0e704f. [security] Plan: route vb-email-service and vb-storage-service through vb-express instead of exposing them directly

Follow-up to 455179. Unlike llm-service, these two services can't just have their public IPs released — they're called directly by apps that aren't on Fly's private network:

- **vb-email-service**: called by vb-express (`apps/api/vb-express/src/routes/messaging.ts:99`) and by email-subscription-service (`apps/api/email-subscription-service/src/main.ts:30,90` — itself a Fly app, so this leg _can_ move to flycast independent of the rest), plus three Vercel-hosted callers that hit the public fly.dev URL directly: `apps/hearth/src/app/api/homes/[id]/members/route.ts:9-12`, `apps/ui/small-business-next/src/app/api/notify/route.ts:8-9`, `apps/ui/vb-manager-next/src/app/api/send-email-message/route.ts:22`.
- **vb-storage-service** (bucket-service): called only by `apps/ui/vb-manager-next/src/app/api/bucket/route.ts:9-27` (upload/download/list), also from Vercel.
- **email-subscription-service** itself has public `/api/subscribe`, `/api/unsubscribe`, `/api/notify` routes (`apps/api/email-subscription-service/src/main.ts:167-278`) with no in-repo caller found — needs a decision on whether it's intentionally a public-facing API (future newsletter signup) or can be locked down too.

Vercel serverless functions can't join Fly's 6PN network, so fully closing this off means adding proxy/passthrough routes on vb-express and repointing those Vercel apps at vb-express's public URL instead of the backend services' fly.dev URLs — real app-code work across 4+ apps, not just a fly.toml change. This entry is scoping/planning only; no implementation.

**Steps:**

1. Decide per service whether to gateway it through vb-express or accept it stays public:
   - vb-email-service: design a `POST /api/gateway/send-email`-style route on vb-express that forwards to email-service internally (flycast), matching the existing `API_KEY_HEADER`/`SHARED_APP_TOKEN` auth pattern (`llm-service.client.ts:15`, `messaging.ts`). If adopted, repoint hearth/small-business-next/vb-manager-next's `EMAIL_SERVICE_URL` at vb-express's public URL and update `scripts/deploy-vercel.ts:175-176`, which currently injects the raw email-service URL into Vercel env.
   - vb-storage-service: design equivalent passthrough routes for `apps/ui/vb-manager-next/src/app/api/bucket/route.ts`'s upload/download/list operations, noting these may carry larger/streamed payloads than the JSON email gateway.
   - email-subscription-service: resolve whether its public routes are intentional (legitimate exception to "vb-express only") or unused and safe to lock down once a real caller exists.
2. For whichever services move behind the gateway, add the vb-express routes, then repeat 455179's lockdown steps (release public IPs, allocate flycast, update fly-configs) for each.
3. Update the calling apps' env vars/URLs to point at vb-express instead of the backend services directly.
4. Update `docs/api/deployment/fly-service-pattern.md` and `docs/infrastructure/network-management.md` once the target architecture is decided; cross-reference 4eb262 (private-networking performance) and 240ff8 (open email relay hardening), which overlap with whatever ends up staying public.
5. Whatever stays public after step 1 should get hardening (240ff8 already covers vb-email-service's caller-controlled to/from/html; consider similar allowlisting for bucket-service) rather than being left exposed with no mitigation.

## P3

### 9f4e45. [security] Non-constant-time API-key comparison

**`libs/@vigilant-broccoli/fastify/src/plugins/api-key.plugin.ts:32`** (`providedKey === apiKey`), `apps/socket-server-socketio/src/main.ts` (`token === SENDER_TOKEN`). Use `crypto.timingSafeEqual`. (vb-express's hashed `verifyApiKey` path is fine.)

### a10595. [security] RabbitMQ TLS server-identity verification disabled

**`apps/api/email-service/src/main.ts:30`**, `email-subscription-service/src/main.ts:49` (`checkServerIdentity: () => undefined`). CA is still pinned; drop the override or pin the expected CN/SAN.

### ab1da0. [security] checklist-viewer renders marked output without sanitization

**`libs/@vigilant-broccoli/react-utility/src/lib/checklist-viewer.tsx:87,182,274`** pipes `marked.parser()` into `dangerouslySetInnerHTML` with no DOMPurify (its sibling `markdown-viewer.tsx` sanitizes). Author-controlled today; latent stored-XSS if pointed at user content. Add DOMPurify.

### ae83d3. [security] Mobile app stores Google `provider_token` in `localStorage`

**`apps/vb-manager-next-mobile/src/app/providers/auth-provider.tsx:63`** (XSS-exfiltratable). Prefer sessionStorage/in-memory.

### aefbbb. [security] RabbitMQ TLS private key world-readable

**`infrastructure/terraform/cloud-init-rabbitmq.yaml:23-24`** (`server.key` at `0644`). Set `0600` (gitea/code-server cloud-inits already do).

### b33395. [security] Plaintext RabbitMQ ports published on host

**`infrastructure/terraform/cloud-init-rabbitmq.yaml:59-62`** (5672/15672 on 0.0.0.0; Docker bypasses host iptables). Remove the mappings or bind `127.0.0.1:`.

### b5b994. [security] Committed cert leaks VM public IP

**`projects/nx-workspace/scripts/vault-ca.crt`** (SAN `IP Address:136.116.117.204`); old IP in `notes/tech/.../hashicorp-vault.md`. Gitignore the generated cert / distribute out-of-band.

### b8169a. [security] Default credentials in local docker-compose

**`infrastructure/local/docker-compose.yml:82,140-141`** — Grafana `admin`/`admin`, Immich Postgres `postgres`/`postgres`. Localhost-bound (mitigated), but set real passwords via the gitignored `.env`.

### b92f95. [security] code-server login password == sudo password

**`infrastructure/terraform/cloud-init-code-server.yaml:80-81`** (leaked web password → container root). Separate the two.

### bb6d65. [security] Unverified binary/`curl|bash` installs

`cron-backup.yml:125` (mongodb-tools `.deb`, no checksum), `deploy-github-profile.yml:39` + `cron-backup.yml` (`ssh-keyscan` TOFU), `cloud-init-code-server.yaml` (nodesource `curl|bash` as root each VM init), Packer `provision.sh:29-30` (`get.docker.com`). Pin/verify checksums; hardcode GitHub's published host keys.

### be5852. [performance] RabbitMQ publish-channel race leaks connections

**`apps/api/email-service/src/main.ts:38-57`** (and the email-subscription copy) caches the channel, not a connect promise: two concurrent first requests each open a connection and the loser idles forever; error paths null the channel but never close the connection. Cache the promise; close on error.

### be5cf7. [performance] `common-node` barrel drags winston/archiver/qrcode into every service

**`libs/@vigilant-broccoli/common-node/src/index.ts`** re-exports the whole lib, so services importing only `getEnvironmentVariable` pay require-time + image weight for all three. Split entry points.

### d19470. [performance] vb-express auth DB is synchronous `node:sqlite`

**`apps/api/vb-express/src/auth.ts:3,31`** (`DatabaseSync`); every session/API-key check blocks the event loop, serializing streaming responses under burst. Fine at personal scale; worth knowing.

### d1a94d. [performance] Small sequential-await nits

**`apps/api/vb-express/src/routes/api-keys.ts`** (two independent `findMany`s → `Promise.all`); email-subscription `/notify` awaits `queueEmail` per subscriber in a loop.

### d47732. [performance] `deploy-notify` npm-installs `socket.io-client` per notification

**`.github/actions/deploy-notify/action.yml:33-35`** — now pinned + `--ignore-scripts` (#109), but still 2+ registry installs per deploy; replace the emit with a plain HTTPS POST or cache the install.

### e6849f. [performance] Daily `cron-backup` re-downloads tooling uncached

mongodb-tools .deb (~90MB) + pgdg apt setup every day (`cron-backup.yml:125-126`); cache with `actions/cache`.

### eef44b. [performance] OCI VMs pay full apt provisioning on every replacement

All three cloud-inits do `package_update/upgrade` + Docker install at first boot; fine while replacements are rare, bake an OCI image if they become routine. Also ~700MB `google-cloud-cli` is baked into the GCP image just to read 4 secrets at first boot — a metadata-token + Secret Manager REST `curl` would do.

### ef2df0. [performance] hearth misc nits

New `S3Client` per R2 operation (`api/where-is/r2.ts:8-9`; a 10-image POST = 10 clients); chat calendar-intent path pays a full non-streamed completion before the real streamed one (`api/chat/route.ts`); `home-provider.tsx` context value recreated per render; `where_is_items` GET has no pagination/column list; where-is create refetches the full list to learn the new item's id (`where-is/page.tsx`) — return the created item from the POST instead.

### f0a1b2. [performance] vb-manager misc nits

`buildFileTree` awaits `stat` per entry serially (`api/docs/structure/route.ts:29`); weather route is `force-dynamic` with no server cache.

### f2e3a4. [performance] Shared-component nits

`CRUDListManagement.tsx` recreates handlers and re-renders every row on any list change (memo a row component before lists grow); `ThemeProvider.tsx:57` context value recreated per render; `GithubActionsBadges.tsx` refetches the workflows API on every mount, uncached.

### f4d5e6. [performance] Shell/dotfile nits

`setup/dotfiles/zsh/scripts/docker_cleanup.sh:15` uses `stat -f %m` (breaks the 7-day throttle on Linux) and hits the Docker daemon as part of its check; `setup/dotfiles/zsh/.rc.zsh:10` forks `sysctl|grep` per shell, `:37` re-sources `~/.bash_profile`, `:39` re-sources tmux conf per shell; `load_aliases` spawns ~5 `find`s + ~20 `source`s per startup.

### f5e6f7. [performance] Manual-op script nits

`backup-secrets.sh` makes several ~1s `bw` round trips per note chunk (list once, look up with `jq`); `secret-rotation:all` chains four scripts each opening its own IAP tunnel (~5–10s each); `check-cloudflare-access-security.sh` re-fetches the Cloudflare IP list per hostname and spawns `python3` per CIDR; root `format` (`package.json:8`) runs prettier over the whole repo with no `--cache`; `scripts/shell/oci-ssh.sh:8-12` pays `terraform output` + `ssh-keyscan` before every SSH — cache the IP, keyscan only on host-key failure; nx `parallel` left at default 3.

### 1c8bcf. [maintenance] Framework surface

- The Angular 21 toolchain (~25 devDependencies) exists for one app, `cloud-8-skate-angular`. Migrating it to the React/Next stack removes the largest maintenance burden in the workspace.

### 2bf612. [maintenance] Seafile is pinned at 11.0.13 — deferred major-version upgrade (11 → 12 → 13)

**`infrastructure/terraform/cloud-init-seafile.yaml`** (pins `seafileltd/seafile-mc:11.0.13`) + **`infrastructure/terraform/aws-seafile.tf`** (`aws_ebs_volume.seafile_data` — the persistent volume the `db`/`seafile` services bind-mount, independent of the instance lifecycle, so this upgrade needs no further data migration, only compose-file changes on that already-persistent volume)

Deliberately deferred, not a bug — for a personal solo-admin file-sync/backup deployment, 12.0/13.0 don't add much day-to-day. Their new features (SeaDoc collaborative whiteboard, real-time notification server, SeaSearch full-text search — Pro-flavored, a metadata server for extended file properties, better video thumbnails) are all things this deployment would disable anyway. The actual long-term driver is staying on a version that still receives security patches, not new functionality — worth revisiting eventually, not urgently.

**Why it's a real project, not a tag bump:** an attempt this session jumped straight from 11.0.13 to 13.0.25 and broke `seaf-server` (site down, `HTTP 502`) — Seafile requires sequential major-version upgrades because each major version has its own required docker-compose env-var interface:

- **11.0.13 (current):** our custom compose only passes `DB_HOST`, `DB_ROOT_PASSWD`, `TIME_ZONE`, `SEAFILE_ADMIN_EMAIL`, `SEAFILE_ADMIN_PASSWORD`, `SEAFILE_SERVER_LETSENCRYPT`, `SEAFILE_SERVER_HOSTNAME` — MySQL root only, no dedicated app DB user.
- **12.0** (per `https://manual.seafile.com/12.0/repo/docker/ce/{env,seafile-server.yml}`) needs: `DB_HOST`, `DB_PORT`, `DB_USER` (new — dedicated non-root `seafile` MySQL user), `DB_ROOT_PASSWD`, `DB_PASSWORD` (new secret for that user), `SEAFILE_MYSQL_DB_CCNET_DB_NAME`/`_SEAFILE_DB_NAME`/`_SEAHUB_DB_NAME` (defaults should already match our DB), `TIME_ZONE`, `INIT_SEAFILE_ADMIN_EMAIL`/`INIT_SEAFILE_ADMIN_PASSWORD` (renamed, INIT-only so harmless on an existing install), `SEAFILE_SERVER_HOSTNAME`, `SEAFILE_SERVER_PROTOCOL` (new — worth testing as `https` directly, possibly obsoleting the `fix-csrf.sh` post-boot sed hack already in `cloud-init-seafile.yaml`), `JWT_PRIVATE_KEY` (new mandatory secret, ≥32 chars, required even with SeaDoc/notification disabled), `ENABLE_SEADOC=false` (skip the extra sdoc-server/notification-server services). The `db` service should add `MARIADB_AUTO_UPGRADE=1` plus the official healthcheck (`healthcheck.sh --connect --mariadbupgrade --innodb_initialized`) with `depends_on: db: condition: service_healthy` on `seafile`.
- **13.0** (per `https://manual.seafile.com/13.0/repo/docker/ce/{env,seafile-server.yml}`) renames the DB vars again: `SEAFILE_MYSQL_DB_HOST`/`_USER`/`_PASSWORD` (was `DB_HOST`/`DB_USER`/`DB_PASSWORD`), `INIT_SEAFILE_MYSQL_ROOT_PASSWORD` (was `DB_ROOT_PASSWD`); same `JWT_PRIVATE_KEY`/`SEAFILE_SERVER_HOSTNAME`/`SEAFILE_SERVER_PROTOCOL`; new `CACHE_PROVIDER` (defaults `redis`, but `memcached` stays fully supported via `MEMCACHED_HOST`/`MEMCACHED_PORT` — set `CACHE_PROVIDER=memcached` to avoid adding a Redis service we don't need). `ENABLE_NOTIFICATION_SERVER`/`ENABLE_SEAFILE_AI`/`ENABLE_FACE_RECOGNITION` already default `false`. Breaking changes per `https://manual.seafile.com/latest/upgrade/upgrade_notes_for_13.0.x/`: WebDAV drops LDAP-account login (not applicable — no LDAP here), old file-tags feature removed (check if used before upgrading).

**Do not adopt Seafile's official `caddy.yml`** (`lucaslorentz/caddy-docker-proxy`) during either step — it mounts `/var/run/docker.sock` into the Caddy container (a container-to-host-root privilege-escalation path) and does its own ACME/Let's Encrypt TLS by default, which can't complete behind Cloudflare Access anyway (exactly why `aws-seafile.tf`'s `cloudflare_origin_ca_certificate.seafile` + our static Caddyfile exist). Keep the existing `caddy` service in `cloud-init-seafile.yaml` untouched across both steps; only adapt `db`/`memcached`/`seafile`.

**Steps:**

1. Snapshot `aws_ebs_volume.seafile_data` first (`aws ec2 create-snapshot`, fast and non-disruptive) as a rollback point.
2. Add `random_password` Terraform resources for the two new secrets (`DB_PASSWORD`/`SEAFILE_MYSQL_DB_PASSWORD` for the new non-root DB user, `JWT_PRIVATE_KEY`) in `aws-seafile.tf`, alongside the existing `random_password.seafile_db_root_password`/`seafile_admin_password`, and thread them into the `cloud-init-seafile.yaml` `templatefile()` call the same way.
3. Do the 11→12 step live via SSH first: edit the on-box `/opt/seafile/docker-compose.yml` `db`/`memcached`/`seafile` blocks per the env-var mapping above, `docker compose pull && up -d`, and verify — clean `seaf-server`/`seahub` startup in `docker logs seafile`, `HTTP 200`/`302` via curl, and an actual browser login — before touching the 12→13 step.
4. Repeat for 12→13 with its renamed env vars once 12.0 is confirmed healthy.
5. Only after both steps are verified working live, update `cloud-init-seafile.yaml`'s `docker-compose.yml` template and the image tag in `aws-seafile.tf`/`cloud-init-seafile.yaml` to match the final verified 13.0 config, so a future instance replacement (still periodic — see the AMI-drift discussion elsewhere in this repo's Seafile setup) lands correctly instead of replaying a broken intermediate state.
6. Test whether `SEAFILE_SERVER_PROTOCOL=https` makes the `fix-csrf.sh` sed-based workaround in `cloud-init-seafile.yaml` unnecessary; remove it if so, otherwise leave it as a harmless idempotent safety net.

### ce18a7. [maintenance] No shared `localStorage` state hook — 9 hand-rolled copies split across two incompatible strategies

`libs/@vigilant-broccoli/react-lib/src/hooks/` contains exactly one hook (`useGeolocation.ts`), so every UI-preference persistence site re-implements read → validate → write by hand, in one of two mutually incompatible ways:

**Strategy A — read in `useEffect`** (SSR-safe, but flashes the default on first paint): `react-lib/src/components/ThemeProvider.tsx:32-38`, `react-lib/src/components/CollapsibleList.tsx:33-47`, `vb-manager-next/src/app/components/quick-links.component.tsx:12-21`, `search-dialog.component.tsx:132-141`, `demos/LanguageLearning.tsx:582-632`, `(pages)/dev-dashboard/page.tsx:30-39`.

**Strategy B — lazy `useState` initializer behind `typeof window === 'undefined'`** (no flash, but server HTML and the client's first render disagree whenever the stored value differs from the default → React hydration mismatch): `kanban.component.tsx:634-638`, `google-tasks.component.tsx:325-337` and `:959-965`, `hooks/useNotepad.ts:32-33`.

Strategy A's flash is not cosmetic where panels unmount. On `dev-dashboard`, Radix `Tabs.Content` renders only the active tab, so a user whose stored tab is `cloud` still mounts the Local panel for one paint — firing `PUBLIC_IP`, `LOCAL_IP`, `SSH_KEY`, `DOCKER_CONTAINERS`, `PM2_PROCESSES`, and `LOCAL_SERVICES` (all fetch on mount) before tearing it down. Related: the polling cost of those same routes is 0d64c9.

Separately, `search-dialog.component.tsx:23` and `quick-links.component.tsx:7` both define `LOCAL_STORAGE_KEY = 'quick-links-grouped-state'` — one key backing two independent `isGrouped` states, so toggling grouping in one component leaves the other stale until remount.

**Desired end state:** one `useLocalStorageState` hook in `react-lib/src/hooks/`, owning the read/validate/write, exposing a `hydrated` flag so callers can gate render instead of flashing, and syncing via the `storage` event (`ThemeProvider.tsx:40-50` already implements that listener and is the pattern to lift).

**Steps:**

1. Add `libs/@vigilant-broccoli/react-lib/src/hooks/useLocalStorageState.ts`, following `useGeolocation.ts`'s shape (named `export function`, `useEffect`-based, no class). Roughly `useLocalStorageState<T>(key, defaultValue, options?: { isValid?, parse?, serialize? })` returning `{ value, setValue, hydrated }`. Read in `useEffect` (not a lazy initializer) so SSR and first client render always agree; `hydrated` lets callers return `null`/a skeleton for one paint rather than committing to a wrong default. `isValid` covers the union-validation the tab/sort-mode sites already do by hand (`LanguageLearning.tsx:584-589`, `google-tasks.component.tsx:328-334`, `isTab` in `dev-dashboard/page.tsx`); `parse`/`serialize` cover the JSON sites in step 5.
2. Export it from `libs/@vigilant-broccoli/react-lib/src/index.ts` alongside the existing `hooks/useGeolocation` line. Note this lib publishes to npm (`project.json:36` `publish-package`), so the barrel export is public API — and per 5cbc97 the barrel is already the subject of a `sideEffects`/subpath cleanup, so keep the hook free of module-scope side effects.
3. Migrate the strategy-A sites listed above. `CollapsibleList.tsx` is the odd one — it persists one key _per item_ (`storageKey(item.id)`) and already tracks its own `mounted` flag, so either call the hook per item or leave it and note why.
4. Migrate the strategy-B sites (`kanban.component.tsx`, both `google-tasks.component.tsx` sites, `useNotepad.ts`). This is the substantive fix: it removes the `typeof window` guards and the hydration mismatches they cause. `useSortModeStorage` (`google-tasks.component.tsx:323`) becomes a thin wrapper over the new hook.
5. Fold in the JSON-serialized stores — `hooks/useChatHistory.ts:40-57`, `hooks/useNotificationHistory.ts:18-59`, `useNotepad.ts:33-39` — only if `parse`/`serialize` land in step 1; otherwise leave them and say so.
6. Fix the `'quick-links-grouped-state'` collision: either give `search-dialog` its own key (accepting that existing users' saved grouping resets once) or let both share one hook instance so the `storage`-event sync keeps them consistent.
7. **Preserve every existing key string verbatim** while migrating — `'notepad:content'`, `'vb-manager-chats'`, `'swimlanes-boards'`, `'quick-links-grouped-state'`, `'language-learning-*'`, `'dev-dashboard-tab'`, `'google-tasks-selected-list-id'`. The naming is inconsistent (`:` vs `-` separators, some `vb-manager-` prefixed, most not), but renaming keys silently discards whatever users have stored. Normalize in a separate change with a migration read if it's worth doing at all.
8. Out of scope: auth-token storage (`createSupabaseAuth.tsx:95-195`, the `auth-provider.tsx` files in hearth / small-business-next / employee-handler-ui / vb-manager-next-mobile). Different concern with a security dimension — the mobile `provider_token` case is tracked as ae83d3.
9. Verify with `npx nx lint react-lib vb-manager-next` and a typecheck of each consuming app, then manually reload each migrated surface to confirm the preference actually survives and no hydration warning appears in the console. Bump/release `react-lib` per its `publish-package` flow if consumers resolve it from npm rather than the workspace.

## Feature

### Enhancements

#### f7afb2. Provision Vault JWT policies/roles declaratively instead of the imperative post-init script

**`infrastructure/terraform/scripts/post-apply.sh`, `infrastructure/terraform/packer/scripts/run-vault-post-init.sh`, `infrastructure/config.sh`, `package.json` (`gcp:vm:post-init`)**

Vault's JWT auth config — the `github-actions-role` / `-rotate-role` / `-pr-check-role` roles and their policies — is currently written by the imperative `run-vault-post-init.sh`, which is really a VM-**bootstrap** script (it also runs `vault operator init`, enables the KV/JWT mounts, and seeds a `kv/test` placeholder). #217 made `post-apply.sh` call `npm run gcp:vm:post-init` on the IP-unchanged path so a new/edited role (e.g. `github-actions-pr-check-role`) is no longer silently skipped on a normal `tf:apply` — but that's an interim fix: it re-runs the whole heavy bootstrap script over IAP SSH on every apply, and policy/role definitions live as here-doc strings in a shell script rather than as reviewable declarative state.

**Desired end state:** Vault policies/roles are managed as first-class Terraform resources (the `hashicorp/vault` provider's `vault_policy` + `vault_jwt_auth_backend_role`), so `tf:plan` shows role/policy diffs and `tf:apply` reconciles them like any other resource — no imperative re-run, no piggy-backing on VM bootstrap. `run-vault-post-init.sh` shrinks to genuine one-time bootstrap (init + mount enablement), and `post-apply.sh` no longer needs the interim unconditional `post-init` call.

**Steps:**

1. Add the `hashicorp/vault` provider to `infrastructure/terraform/main.tf` `required_providers`, configured to reach Vault over the same path local Terraform already uses (WireGuard `10.0.1.1:8200` + `NODE_EXTRA_CA_CERTS`/`VAULT_CACERT`); source the root token the way `load-vault-tf-env.sh` / `gcp-vault-token.ts` already do rather than a new secret. Confirm the CI path (`vault.harryliu.dev` tunnel) isn't broken — Terraform apply is local-only today, so this stays local.
2. Port the two policies and three roles from `run-vault-post-init.sh` into `vault_policy` + `vault_jwt_auth_backend_role` resources, keeping the exact names/paths/TTLs/`bound_claims` (`job_workflow_ref` scoping for the rotate and pr-check roles) so nothing changes semantically. Reference `infrastructure/config.sh` values as Terraform vars/locals to keep one source of truth.
3. `terraform import` the existing live policies/roles into the new resources so the first apply is a no-op diff, not a destroy/recreate.
4. Strip the policy/role/`kv/test` blocks out of `run-vault-post-init.sh`, leaving only true bootstrap (init + KV/JWT mount enable). Remove the interim unconditional `npm run gcp:vm:post-init` call added to `post-apply.sh`'s IP-unchanged branch in #217.
5. Update docs: [secret-management.md](./docs/infrastructure/secret-management.md) (the role/policy inventory now lives in Terraform) and any reference to `pnpm gcp:vm:post-init` being required after adding a Vault role.
6. Verify: `pnpm tf:plan` shows the imported roles/policies as no-change, then edit one `bound_claims` and confirm `tf:plan` shows the diff and `tf:apply` reconciles it without touching the VM; confirm `ci-pr-check` and `ci-rotate-secrets` still authenticate to Vault afterward.

#### b848da. Self-host journal.harryliu.dev on gitea-vm instead of Cloudflare Pages, so notes stop resting on third-party storage

**`infrastructure/terraform/cloudflare-journal.tf`, `.github/workflows/cron-deploy-journal.yml`, `projects/nx-workspace/apps/ui/journal/project.json`**

`journal.harryliu.dev` is gated by Cloudflare Zero Trust Access (owner-email only — `cloudflare-journal.tf`), but the notes content itself still ends up resting in full, in plaintext, on infrastructure outside the owner's control: `cron-deploy-journal.yml` runs hourly on a GitHub-hosted runner, fetches the private notes archive from Gitea over the internet (Gitea token + CF Access service-token creds pulled from Vault), builds a static snapshot (`build-snapshot.mjs`), and deploys it to the `staging-journal` Cloudflare Pages project (`project.json`'s `deploy`/`ensure-cf-project` targets) — so both a GitHub-hosted runner and Cloudflare's Pages storage hold a full copy of personal journal content, protected only by an access-control layer in front rather than by keeping the data off third-party storage in the first place. (`cloudflare-journal.tf`'s Access `destinations` even has to cover the `*.pages.dev` wildcard precisely because Pages keeps every past deploy's content reachable.)

**Desired end state:** serve journal directly from the existing self-hosted `gitea-vm` (`infrastructure/terraform/oci-gitea.tf`) — the same trust model already used for `git.harryliu.dev`/`code.harryliu.dev` (self-hosted OCI VM + Cloudflare Access, proxied A record, no third-party storage of content) — reading notes from the co-located Gitea data on localhost instead of fetching a token-gated archive over the public internet every hour, and delete the GitHub Actions cron entirely. This also resolves the unrelated performance item `45c377` (`cron-deploy-journal` rebuilding unconditionally 24x/day) by removing the recurring job rather than just gating it. Co-locate on `gitea-vm` rather than provision a new VM — per [network-management.md](./docs/infrastructure/network-management.md)'s note on `drive.harryliu.dev`, the OCI free tier's 50GB-per-boot-volume floor already leaves no headroom for another Ampere VM.

**Steps:**

1. Add a `journal` service to `infrastructure/terraform/cloud-init-gitea.yaml`'s docker-compose (alongside the existing `gitea`/`caddy` services) that reads notes directly from the bare repo under the mounted `/mnt/gitea-data` volume (e.g. `git --git-dir=... archive main` locally — no network fetch, no Gitea/CF Access token needed) and serves the built static output; refresh on a short interval (systemd timer or in-container cron) instead of hourly. Add a matching site block to the `Caddyfile` — no security-list change needed, since `gitea_sl`'s existing 80/443 rules already allow Cloudflare's IP ranges regardless of hostname.
2. Add a `cloudflare_origin_ca_certificate` + `tls_cert_request` for `var.journal_domain`, copying `cloudflare-gitea.tf:26-31`'s shape (`hostnames = [var.journal_domain]`), so Caddy can terminate TLS for the new site block the way it does for `gitea_domain`.
3. In `infrastructure/terraform/cloudflare-journal.tf`, replace the `cloudflare_pages_domain` resource with a `cloudflare_dns_record` (A record, proxied, `content = oci_core_instance.gitea.public_ip`) matching `cloudflare_dns_record.gitea`'s shape; keep the existing `cloudflare_zero_trust_access_application`/policies (same owner-email + CI service-token gating) but drop the `*.pages.dev`/wildcard destinations, which no longer apply.
4. Delete `.github/workflows/cron-deploy-journal.yml` and the `deploy`/`ensure-cf-project`/`prune-deployments`/`manual-deploy` targets in `projects/nx-workspace/apps/ui/journal/project.json`; decide whether the Vite `build` target still runs in CI for lint/typecheck coverage or moves entirely onto the VM.
5. Retire the `staging-journal` Cloudflare Pages project once cut over.
6. Update [network-management.md](./docs/infrastructure/network-management.md)'s `journal.harryliu.dev` line (currently "Cloudflare Pages `staging-journal`...") to describe the gitea-vm-hosted setup, and revisit [repo-patterns.md](./docs/repo-patterns.md)'s note that "`journal` is deliberately single-environment" if the deploy mechanism change affects that framing.
7. Close `45c377` as resolved by this change instead of by its own fix, since deleting the cron removes the recurring cost entirely.
