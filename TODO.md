# Repo Audit — Outstanding Issues

## P1

### 009c6e. [security] CI GitHub Actions service account is massively overprivileged

**`infrastructure/terraform/main.tf:311-345`** (`github_actions_secret_accessor`, `_editor`, `_workload_identity_pool_admin`, `_service_account_admin`)

The WIF-federated `github-actions` SA that every workflow can impersonate holds project `roles/editor`, `roles/iam.serviceAccountAdmin`, `roles/iam.workloadIdentityPoolAdmin`, and project-level `roles/secretmanager.secretAccessor`. A single compromised workflow run can read almost every secret (Vault root token, WG server key, unseal keys), rewrite the Workload Identity Pool for persistence, and take full project control.

Two mitigations have since landed and narrow the blast radius without closing the finding: the `secretAccessor` grant now carries an IAM condition excluding `BITWARDEN_PASSWORD` (#159), and the pool provider's `attribute_condition` refuses `pull_request` tokens outright so untrusted PR-branch workflow YAML can't reach this SA at all (it must use the narrow `github-pr-check` provider in `github-actions-pr-check.tf`). Everything else — every other secret, editor, and pool/SA admin — is still reachable from any push/dispatch/`workflow_run` job.

**Fix:** Terraform applies run locally, so CI does not need editor/SA-admin/pool-admin — remove all three. Replace the project-level `secretAccessor` with per-secret `google_secret_manager_secret_iam_member` grants for only the secrets workflows actually read (per `cloudflare-vault.tf`, the CF Access token pair + tunnel token).

### 16dbe5. [performance] code-server VM re-provisions its entire toolchain (~1GB+) on every container (re)start

**`infrastructure/terraform/cloud-init-code-server.yaml:27-66`** (init script), `:72` (`:latest`)

The `/custom-cont-init.d` script runs at every container start: `apt-get update/install` runs unconditionally, and the `command -v`-guarded blocks (Node, ~700MB `google-cloud-cli`, claude-code) only survive while the same image filesystem is alive. It also clones/pulls this repo and then runs `setup/linux/apt-packages.txt` + `setup/linux/install.sh` in full on every start, so the wipe now costs more than the original ~1GB estimate. Watchtower no longer auto-updates `linuxserver/code-server:latest` on this VM, but any deliberate redeploy — `terraform apply` (VM recreation) or a manual `docker compose pull && up -d` — still discards the toolchain layer: 1GB+ of downloads and minutes of apt/npm before code-server can start.

**Fix:** bake a derived image (`FROM lscr.io/linuxserver/code-server` + toolchain in a Dockerfile), push to Docker Hub, and reference it here. Cheaper fallback: install the toolchain under the persistent `/config` volume (or gate the script on a `/config` marker file) and pin the image tag.

## P2

### 8f204c. [security] Watchtower still holds docker.sock on the RabbitMQ VM, watching an unpinned `:latest` image

**`infrastructure/terraform/cloud-init-rabbitmq.yaml:108-118`** (`watchtower` service), `:80` (`iamharryliu/socket-server-socketio:latest`, `pull_policy: always`)

#168 removed Watchtower from the Gitea and code-server VMs and deleted the entry that had tracked this outright — but the RabbitMQ VM's instance was deliberately kept, because the 300s poll _is_ the deploy path for socket-server. The security properties that entry described still hold for this one and are now tracked nowhere: the container mounts `/var/run/docker.sock` (root-equivalent on the host), the watchtower image itself is unpinned (`containrrr/watchtower`, no tag), and it auto-pulls `iamharryliu/socket-server-socketio:latest` every 5 minutes. Compromise of the `iamharryliu` Docker Hub account, or of the `containrrr/watchtower` image, is automatic RCE on the VM that also runs the RabbitMQ broker for every email service.

This is a real tradeoff, not an oversight — removing Watchtower here means replacing the socket-server deploy mechanism. **Fix (whichever is preferred):** pin `containrrr/watchtower` to a digest and deploy socket-server by digest rather than `:latest`; or replace the poll with a push deploy (the `deploy-notify` action already reaches this VM) and drop the docker.sock mount entirely. At minimum, enforce strong 2FA on the Docker Hub account, since it is currently a single-factor path to host root.

### 17daeb. [security] GCP VMs on `default` network; default-allow-ssh likely open on the Vault VM

**`infrastructure/terraform/main.tf:96-127`**

Only WireGuard-UDP and IAP-SSH firewall rules are defined on the `default` network; nothing deletes GCP's auto-created `default-allow-ssh` (tcp/22 from 0.0.0.0/0). The IAP-only rule is additive, so port 22 on the Vault VM is probably internet-open, defeating the IAP-only design. **Fix:** dedicated VPC with explicit rules only, or delete/manage `default-allow-ssh` in Terraform so the repo is the source of truth.

### 1a2b1b. [security] Default compute SA has project-wide secret access + `cloud-platform` scope

**`infrastructure/terraform/main.tf:103-104`** (scopes) + project-level secretAccessor grants

Every VM (including transient Packer build VMs) using the default SA can read all project secrets and use the Vault KMS unseal key — any RCE on the box yields Vault root token + WG private key + Bitwarden password. **Fix:** dedicated SA for `vb-free-vm` with per-secret grants (needs only `VB_VM_WG_*`, `VB_VM_CLOUDFLARED_TUNNEL_TOKEN`) + the KMS key; run Packer with a separate minimal SA.

### 20177f. [security] RabbitMQ management UI + SSH exposed to 0.0.0.0/0; user is `admin`

**`infrastructure/terraform/oci.tf:49-90`**

The management UI (TLS but single-factor, username `admin`) is internet-reachable — continuous credential-stuffing surface. SSH/22 is world-open on all three OCI VMs. **Fix:** restrict 15671 and 22 to home/WG egress IPs. (5671 AMQPS must stay open for fly.io consumers — justified.)

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

### 306cc4. [security] Single shared Vault role gives every workflow the whole secret store

**`infrastructure/terraform/packer/scripts/run-vault-post-init.sh`** (policy grants `kv/data/secrets/*`) · consumed by `.github/actions/vault-secrets/action.yml`

Role `github-actions-role` is usable by any job with `id-token: write` — including low-stakes smoke tests. The `secrets:` filter in the composite action is cosmetic; a compromised step can mint its own OIDC token and dump the whole KV path. **Fix:** per-purpose Vault roles bound with `bound_claims.job_workflow_ref` (the rotate role in the same script already shows the pattern) exposing only the keys each workflow needs.

**Partially addressed** for `ci-pr-check.yml`: the nx-cache remote-cache PR gave it its own `github-actions-pr-check-role` (policy scoped to `kv/data/ci-pr-check` only) plus its own minimally-scoped GCP service account/WIF provider — that was the urgent instance, since `pull_request` (unlike every other trigger here) runs the workflow YAML from the PR branch itself, reachable by outside contributors. Still open: `deploy.yml` and `notify-start` (push-triggered, higher trust bar, but still share the broad `github-actions-role` + `github_actions` GCP SA that also carries `roles/editor`/`serviceAccountAdmin`/project-wide `secretAccessor`) haven't been narrowed — a compromised dependency in either would still reach the whole store.

### 331697. [security] SSH host-key verification effectively disabled when pushing `SHARED_APP_TOKEN`

**`infrastructure/terraform/packer/scripts/sync-socket-server-token.sh:61-63`** (via `ci-rotate-secrets.yml`)

`StrictHostKeyChecking=accept-new` plus `ssh-keygen -R` before connecting = trust-on-first-use every run, then the rotated `SHARED_APP_TOKEN` is piped over that connection. DNS hijack / MITM of `socket.harryliu.dev` presents its own host key, is accepted, and receives the new token. Same TOFU pattern in `cron-backup.yml:79,85` (lower impact). **Fix:** store the VMs' host public keys (not secret) in repo/Vault, write to `known_hosts` with `StrictHostKeyChecking=yes`, drop the `ssh-keygen -R`.

### 427e54. [performance] Follower jobs fire after every deploy — even no-op deploys

Fourteen of the 28 workflows trigger on `workflow_run` (health-check, notify-complete, cleanup-workflow-runs, e2e suites incl. the 5-provider paid-token `test-e2e-llm` matrix, security suites, smoke) — roughly 25 jobs, most doing their own checkout + OIDC + Secret Manager + Vault round trip. `deploy` succeeds even when `has_deployments=false` (`deploy.yml:140-153`), so a push touching nothing deployable still triggers the full fan-out against production; it also double-fires via `ci-rotate-secrets` calling deploy. **Fix:** expose what was actually deployed (job output → `repository_dispatch` per service or an artifact followers check) and exit early otherwise; drop the cron+per-deploy duplication on the `test-security-*` suites.

### 45c377. [performance] `cron-deploy-journal` rebuilds and redeploys hourly, unconditionally

**`.github/workflows/cron-deploy-journal.yml`** — 24×/day: full checkout, pnpm install of the workspace, Vault round trip, Gitea archive download, build (`--skip-nx-cache`!), Cloudflare Pages deploy — even when the journal hasn't changed. The largest recurring CI consumer in the repo (~24 × 3–5 min/day). **Fix:** query the Gitea API for the journal repo's HEAD sha first and compare with the last-deployed sha (stored in GCS/a Pages deployment message/a repo variable); exit early when unchanged.

### 47b3fb. [performance] Queue consumers live inside auto-stopped fly machines — email delivery stalls while stopped

Both email services start their AMQP consumer in the web process but run with `auto_stop_machines = 'stop'`, `min_machines_running = 0` (`deployment-configs/fly-configs/{production,staging}-email-service.toml` and email-subscription tomls). Outbound AMQP doesn't keep fly machines alive: when stopped, queued emails sit until an HTTP request (in practice the Upptime ping) wakes the machine — minutes of delivery delay plus RabbitMQ reconnect churn per cycle. **Fix:** `min_machines_running = 1` for email-service, or move consumers to the always-on VM, or accept and document the delay.

### 496949. [performance] Upptime pings + auto-stop = machines cycle start/stop near-continuously

`.upptimerc.yml` `sites:` includes all the fly apps (staging + production); each check wakes a stopped machine, fly's idle sweep stops it minutes later. Net: a large fraction of always-on runtime is paid anyway, real users still frequently hit cold starts (vb-express runs better-auth migrations at boot), and every cycle re-handshakes RabbitMQ/Supabase. **Fix (pick one per service):** `min_machines_running = 1` for user-facing vb-express, or `auto_stop_machines = 'suspend'` (resume ~sub-second vs full boot), or lengthen the Upptime interval.

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

### 5bdea5. [performance] Vite/Angular bundle-size warnings

- **`component-library`**: JS chunk 676.91 kB / CSS chunk 725.17 kB, both over the 500 kB threshold. CSS cause: `src/main.tsx` imports the full `@radix-ui/themes/styles.css` (812 kB unminified, unpurgeable). JS cause: `libs/@vigilant-broccoli/react-sandbox/src/lib/ComponentSandbox.tsx` statically imports all 13 demo components + 6 utility contents at module top-level, rendered unconditionally even though only one `CollapsibleList` section is open by default — fix with `React.lazy` + `Suspense` per demo.
- **`docs-md`**: JS chunk 520.30 kB / CSS chunk 733.63 kB, over threshold. Same `@radix-ui/themes/styles.css` full import in `src/main.tsx`, used only for the `<Theme>` wrapper — fix by dropping the Radix Themes dependency here in favor of a minimal custom CSS reset (or Radix Themes' documented modular CSS imports: tokens + only needed color scales + components).
- **`journal`**: JS chunk 519.53 kB / CSS chunk 733.63 kB, over threshold. Same root cause and fix as `docs-md`. All three Vite apps additionally have no `build.rollupOptions.output.manualChunks` in `vite.config.mts` — everything (including `react`/`react-dom`/`@radix-ui/themes`) ships as one chunk; splitting vendor deps into their own chunk would help caching independent of the fixes above. (Tailwind content globs in all three are correctly scoped — confirmed not a contributing factor.)

### e17c40. [maintenance] `vb-manager-next-mobile` is deployed to fly but monitored by nothing

**`.upptimerc.yml`** (no `sites:` entry), **`.github/workflows/ci-health-check.yml`** (no check either)

`vb-manager-next-mobile` has `deploy`/`deploy:production` targets in `apps/vb-manager-next-mobile/project.json`, staging and production fly configs (`deployment-configs/fly-configs/{staging,production}-vb-manager-next-mobile.toml`, both with a public `http_service` on `force_https`), an entry in `manual-deploy-app.yml`'s app list, and secrets wiring in `scripts/secrets-mapping.config.ts:47`. It is the only publicly-reachable deployed app in the repo with no status check in either system, which CLAUDE.md's [CI.md](./docs/CI.md) rule forbids — every deployed service with a public URL needs an `.upptimerc.yml` `sites:` entry, and the only documented exemption is for services with no public URL (covered by `ci-health-check` instead), which doesn't apply here.

**Fix:** add `staging-vb-manager-next-mobile` and `production-vb-manager-next-mobile` to `sites:` in `.upptimerc.yml`, following the existing fly entries' shape and their staging-then-production ordering. Pick a path that returns 200 unauthenticated — the sibling Supabase-auth apps use a login route for exactly this (`staging-hearth` → `/login`), so check whether the mobile app's root redirects before settling on `/`. If the app is in fact dormant and not meant to be running, the alternative is to retire it (fly configs, deploy targets, `manual-deploy-app` option, secrets mapping) rather than monitor it — decide which before adding checks.

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

## P3

### c4a917. [security] nx-cache Worker PUT has no size cap

**`infrastructure/cloudflare-workers/nx-cache/index.js`** (PUT branch)

The Worker's immutable-write race (a `head()`-then-`put()` pair that let two concurrent PUTs for the same key both slip through) is now fixed with a conditional `put(..., { onlyIf: { etagDoesNotMatch: '*' } })`. Separately, PUT still streams the body to R2 with no size limit — a leaked write token (held only by `deploy.yml` today) can run up R2 storage until the `nx_cache_r2_ttl_seconds` lifecycle rule expires it. **Fix:** reject PUT when `Content-Length` exceeds a reasonable cache-artifact size (e.g. a few hundred MB).

### 9f4e45. [security] Non-constant-time API-key comparison

**`libs/@vigilant-broccoli/fastify/src/plugins/api-key.plugin.ts:32`** (`providedKey === apiKey`), `apps/socket-server-socketio/src/main.ts` (`token === SENDER_TOKEN`). Use `crypto.timingSafeEqual`. (vb-express's hashed `verifyApiKey` path is fine.)

### a10595. [security] RabbitMQ TLS server-identity verification disabled

**`apps/api/email-service/src/main.ts:30`**, `email-subscription-service/src/main.ts:49` (`checkServerIdentity: () => undefined`). CA is still pinned; drop the override or pin the expected CN/SAN.

### ae83d3. [security] Mobile app stores Google `provider_token` in `localStorage`

**`apps/vb-manager-next-mobile/src/app/providers/auth-provider.tsx:63`** (XSS-exfiltratable). Prefer sessionStorage/in-memory.

### aefbbb. [security] RabbitMQ TLS private key world-readable

**`infrastructure/terraform/cloud-init-rabbitmq.yaml:23-24`** (`server.key` at `0644`). Set `0600` (gitea/code-server cloud-inits already do).

### b33395. [security] Plaintext RabbitMQ ports published on host

**`infrastructure/terraform/cloud-init-rabbitmq.yaml:59-62`** (5672/15672 on 0.0.0.0; Docker bypasses host iptables). Remove the mappings or bind `127.0.0.1:`.

### b5b994. [security] Committed cert leaks VM public IP

**`projects/nx-workspace/scripts/vault-ca.crt`** (SAN `IP Address:136.116.117.204`); old IP in `notes/tech/.../hashicorp-vault.md`. Gitignore the generated cert / distribute out-of-band.

### b92f95. [security] code-server login password == sudo password

**`infrastructure/terraform/cloud-init-code-server.yaml:80-81`** (leaked web password → container root). Separate the two.

### bb6d65. [security] Unverified binary/`curl|bash` installs

`cron-backup.yml:125` (mongodb-tools `.deb`, no checksum), `deploy-github-profile.yml:39` + `cron-backup.yml` (`ssh-keyscan` TOFU), `cloud-init-code-server.yaml` (nodesource `curl|bash` as root each VM init), Packer `provision.sh:29-30` (`get.docker.com`). Pin/verify checksums; hardcode GitHub's published host keys.

### be5852. [performance] RabbitMQ publish-channel race leaks connections

**`apps/api/email-service/src/main.ts:38-57`** (and the email-subscription copy) caches the channel, not a connect promise: two concurrent first requests each open a connection and the loser idles forever; error paths null the channel but never close the connection. Cache the promise; close on error.

### be5cf7. [performance] `common-node` barrel drags winston/archiver/qrcode into every service

**`libs/@vigilant-broccoli/common-node/src/index.ts`** re-exports the whole lib, so services importing only `getEnvironmentVariable` pay require-time + image weight for all three. Split entry points.

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

`backup-secrets.sh` makes several ~1s `bw` round trips per note chunk (list once, look up with `jq`); `secret-rotation:all` chains five scripts each opening its own IAP tunnel (~5–10s each); `check-cloudflare-access-security.sh` re-fetches the Cloudflare IP list per hostname and spawns `python3` per CIDR; root `format` (`package.json:8`) runs prettier over the whole repo with no `--cache`; `scripts/shell/oci-ssh.sh:8-12` pays `terraform output` + `ssh-keyscan` before every SSH — cache the IP, keyscan only on host-key failure; nx `parallel` left at default 3.

### 1c8bcf. [maintenance] Framework surface

- The Angular 21 toolchain (~25 devDependencies) exists for one app, `cloud-8-skate-angular`, plus the `libs/angular/general-components` lib it consumes. Migrating it to the React/Next stack removes the largest maintenance burden in the workspace.

### 4d81ba. [maintenance] Resume markup is implemented twice and has already drifted once

**`libs/@vigilant-broccoli/resume/src/server.ts`** (`buildResumeHtml`/`renderWorkExperience` — HTML strings for the Playwright PDF) vs **`apps/ui/vb-manager-next/src/app/components/resume-view.component.tsx`** (JSX for the `/career` page)

#222 introduced `@vigilant-broccoli/resume` with `resume.json` as the single source of truth for resume _data_, but the _presentation_ is written twice — once as a template-literal HTML document for the headless-Chromium PDF export consumed by personal-website-react's build, once as React for the in-app view. They share no rendering code, so any layout change has to be made in both. This is not hypothetical: #255 added the Project Experience section and removed the spacing above "Soft:" in the React view only, and `vigilant-broccoli` silently dropped out of the published `resume.pdf` until #257 patched `server.ts` to match a day later. The PDF is the artifact that actually gets sent to people, and it is the copy with no UI to notice the drift.

**Fix:** render one tree. The realistic option given the PDF path is headless Chromium is to render the React view to HTML server-side (`react-dom/server`'s `renderToStaticMarkup`) inside `generateResumePdfBuffer` and drop `buildResumeHtml`, keeping the print stylesheet as the only PDF-specific piece. If that pulls too much of vb-manager-next's styling into the lib, the cheaper alternative is to move the shared section/entry components into the `resume` lib itself so both consumers import them. Either way the acceptance test is the same: add a Project Experience entry to `resume.json` and confirm it appears in both `/career` and a regenerated `resume.pdf` without touching two files.

### ce18a7. [maintenance] No shared `localStorage` state hook — 9 hand-rolled copies split across two incompatible strategies

`libs/@vigilant-broccoli/react-lib/src/hooks/` contains exactly one hook (`useGeolocation.ts`), so every UI-preference persistence site re-implements read → validate → write by hand, in one of two mutually incompatible ways:

**Strategy A — read in `useEffect`** (SSR-safe, but flashes the default on first paint): `react-lib/src/components/ThemeProvider.tsx:32-38`, `react-lib/src/components/CollapsibleList.tsx:33-47`, `vb-manager-next/src/app/components/quick-links.component.tsx:12-21`, `search-dialog.component.tsx:132-141`, `demos/LanguageLearning.tsx:582-632`, `(pages)/dev-dashboard/page.tsx:30-39`.

**Strategy B — lazy `useState` initializer behind `typeof window === 'undefined'`** (no flash, but server HTML and the client's first render disagree whenever the stored value differs from the default → React hydration mismatch): `kanban.component.tsx:634-638`, `google-tasks.component.tsx:325-337` and `:959-965`, `hooks/useNotepad.ts:32-33`.

Strategy A's flash is not cosmetic where panels unmount. On `dev-dashboard`, Radix `Tabs.Content` renders only the active tab, so a user whose stored tab is `cloud` still mounts the Local panel for one paint — firing `PUBLIC_IP`, `LOCAL_IP`, `SSH_KEY`, `DOCKER_CONTAINERS`, `PM2_PROCESSES`, and `LOCAL_SERVICES` (all fetch on mount) before tearing it down. (The separate polling cost of those same routes was fixed in #134.)

Separately, `search-dialog.component.tsx:23` and `quick-links.component.tsx:7` both define `LOCAL_STORAGE_KEY = 'quick-links-grouped-state'` — one key backing two independent `isGrouped` states, so toggling grouping in one component leaves the other stale until remount.

**Desired end state:** one `useLocalStorageState` hook in `react-lib/src/hooks/`, owning the read/validate/write, exposing a `hydrated` flag so callers can gate render instead of flashing, and syncing via the `storage` event (`ThemeProvider.tsx:40-50` already implements that listener and is the pattern to lift).

**Steps:**

1. Add `libs/@vigilant-broccoli/react-lib/src/hooks/useLocalStorageState.ts`, following `useGeolocation.ts`'s shape (named `export function`, `useEffect`-based, no class). Roughly `useLocalStorageState<T>(key, defaultValue, options?: { isValid?, parse?, serialize? })` returning `{ value, setValue, hydrated }`. Read in `useEffect` (not a lazy initializer) so SSR and first client render always agree; `hydrated` lets callers return `null`/a skeleton for one paint rather than committing to a wrong default. `isValid` covers the union-validation the tab/sort-mode sites already do by hand (`LanguageLearning.tsx:584-589`, `google-tasks.component.tsx:328-334`, `isTab` in `dev-dashboard/page.tsx`); `parse`/`serialize` cover the JSON sites in step 5.
2. Export it from `libs/@vigilant-broccoli/react-lib/src/index.ts` alongside the existing `hooks/useGeolocation` line. Note this lib publishes to npm (`project.json:36` `publish-package`), so the barrel export is public API — and #197 already split the sonner `Toaster` out to a subpath to keep the barrel side-effect-free, so keep the hook free of module-scope side effects too.
3. Migrate the strategy-A sites listed above. `CollapsibleList.tsx` is the odd one — it persists one key _per item_ (`storageKey(item.id)`) and already tracks its own `mounted` flag, so either call the hook per item or leave it and note why.
4. Migrate the strategy-B sites (`kanban.component.tsx`, both `google-tasks.component.tsx` sites, `useNotepad.ts`). This is the substantive fix: it removes the `typeof window` guards and the hydration mismatches they cause. `useSortModeStorage` (`google-tasks.component.tsx:323`) becomes a thin wrapper over the new hook.
5. Fold in the JSON-serialized stores — `hooks/useChatHistory.ts:40-57`, `hooks/useNotificationHistory.ts:18-59`, `useNotepad.ts:33-39` — only if `parse`/`serialize` land in step 1; otherwise leave them and say so.
6. Fix the `'quick-links-grouped-state'` collision: either give `search-dialog` its own key (accepting that existing users' saved grouping resets once) or let both share one hook instance so the `storage`-event sync keeps them consistent.
7. **Preserve every existing key string verbatim** while migrating — `'notepad:content'`, `'vb-manager-chats'`, `'swimlanes-boards'`, `'quick-links-grouped-state'`, `'language-learning-*'`, `'dev-dashboard-tab'`, `'google-tasks-selected-list-id'`. The naming is inconsistent (`:` vs `-` separators, some `vb-manager-` prefixed, most not), but renaming keys silently discards whatever users have stored. Normalize in a separate change with a migration read if it's worth doing at all.
8. Out of scope: auth-token storage (`createSupabaseAuth.tsx:95-195`, the `auth-provider.tsx` files in hearth / small-business-next / employee-handler-ui / vb-manager-next-mobile). Different concern with a security dimension — the mobile `provider_token` case is tracked as ae83d3.
9. Verify with `npx nx lint react-lib vb-manager-next` and a typecheck of each consuming app, then manually reload each migrated surface to confirm the preference actually survives and no hydration warning appears in the console. Bump/release `react-lib` per its `publish-package` flow if consumers resolve it from npm rather than the workspace.

## Non-Risk Review

Findings from the same audit that the audit's own text already frames as low/accepted risk specifically because this is a solo-admin, personal-scale deployment — no team, no other users, no insider threat model. Kept here for visibility rather than deleted; revisit if that context changes (e.g. the app gains other users, or is exposed beyond loopback/localhost).

### ff4327. [security] Seafile SSH open to 0.0.0.0/0, no brute-force mitigation

**`infrastructure/terraform/aws-seafile.tf:20-25`** (`aws_security_group.seafile` ingress) — the security group's own `description` (`:18`) documents this as an intentional tradeoff ("SSH open, 80/443 restricted to Cloudflare..."), and it's mitigated by key-only auth (Ubuntu's cloud image disables SSH password auth by default). No `fail2ban` or connection-rate limiting is configured, so the box is a continuous target for opportunistic scanning/brute-force attempts, all of which fail without a valid key but still consume log volume and a nonzero CPU/attack-surface cost. Likely an acceptable risk for a single-admin personal server (compare `20177f`'s equivalent finding for the OCI VMs, same tradeoff). **Fix (if ever prioritized):** restrict the `cidr_blocks` on the port-22 ingress rule to a known home/WireGuard egress IP (matching `20177f`'s suggested fix for the OCI boxes), or add `fail2ban` via cloud-init.

### 16815c. [security] `vb-manager-next`: Supabase Google sign-in has no allowlist — accepted risk (not fixed)

**`projects/nx-workspace/apps/ui/vb-manager-next/src/middleware.ts`**, `libs/server-auth.ts`

`middleware.ts` verifies the Supabase bearer token via `supabase.auth.getUser(token)` and admits any valid user — no allowed-emails check. **Any** Google user who completes the Supabase OAuth flow gets a valid session and passes the `/api/*` gate. The session is real access control, but any Google account can obtain one. (Migrated from NextAuth to Supabase auth; the missing-allowlist gap carried over unchanged. `employee-handler-ui`'s `proxy.ts` shows the allowlist pattern this could adopt.)

**Fix:** in `middleware.ts` (and `getUserEmail`), reject unless `data.user.email` is in an `ALLOWED_EMAILS` / `ALLOWED_EMAIL_DOMAINS` allowlist, mirroring `employee-handler-ui/src/proxy.ts`.

**Status:** deliberately left open. Owner's stated threat model: solo use, UI-only interaction, app bound to `127.0.0.1` (confirmed in `ecosystem.config.js` and the local nginx proxy), no external callers — the owner is the only account that will ever complete this app's Google OAuth flow, so the allowlist's marginal value is low here. Revisit if the app is ever exposed beyond loopback or a second Google account is ever expected to authenticate.

### b8169a. [security] Default credentials in local docker-compose

**`infrastructure/local/docker-compose.yml:82,140-141`** — Grafana `admin`/`admin`, Immich Postgres `postgres`/`postgres`. Localhost-bound (mitigated), but set real passwords via the gitignored `.env`.

### d19470. [performance] vb-express auth DB is synchronous `node:sqlite`

**`apps/api/vb-express/src/auth.ts:3,31`** (`DatabaseSync`); every session/API-key check blocks the event loop, serializing streaming responses under burst. Fine at personal scale; worth knowing.

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

#### a3f9c2. hearth where-is: search only matches the AI's literal wording, no semantic fallback

**`apps/hearth/src/app/where-is/page.tsx:38-45`** (`fuzzyMatch`) · **`apps/hearth/src/app/api/where-is/analyze/route.ts`** (existing LLM vision-analysis pipeline)

`fuzzyMatch` requires every word of the search query to appear as a literal substring somewhere in the concatenated title/description/tags — all AI-generated text from `analyze`/`reanalyze`. If the model tagged a drawer "cutting tools" and a user searches "scissors," the query returns nothing: there's no fallback once the literal match misses, which undercuts the feature's actual value (ask in your own words, find the spot) exactly when the AI's wording differs from the user's.

**Desired end state:** when the literal fuzzy match comes up empty (or as the primary path, cost permitting), send the query plus the candidate items' title/description/tags to the same LLM already used for image analysis and have it rank/return the best-matching item(s) — a semantic match instead of a strict substring one.

**Steps:**

1. Add `apps/hearth/src/app/api/where-is/search/route.ts`: accept `{ query, homeId }`, fetch that home's `where_is_items` (title/description/tags only, no images), and prompt the LLM to return the best-matching item id(s) with a short "why" justification, falling back to "no match" rather than guessing.
2. In `where-is/page.tsx`, call this route when `fuzzyMatch` returns zero results for a non-empty query, and surface the LLM's matched item(s) with the "why" text so the result doesn't feel like a black box.
3. Keep the existing literal `fuzzyMatch` as the fast first pass (free, instant) — only pay for the LLM call on a miss.

#### d7e1b4. hearth where-is: flat storage-area list has no room/zone grouping

**`apps/hearth/src/app/where-is/page.tsx`** (`WhereIsPage`, flat `CRUDItemList`) · **`apps/hearth/src/app/where-is/where-is-form.tsx`** (freeform `tags`) · **`apps/hearth/src/lib/types.ts`** (`WhereIsItem`)

Storage areas are a flat, freeform-titled list with tags but no structured location field — there's no way to browse "just the kitchen" or "just the garage." Fine for a handful of entries, but browsing (as opposed to searching) stops working once the list grows past a dozen or so, since nothing groups or filters by physical location.

**Desired end state:** a lightweight `room` concept surfaced as filter chips above the list (All / Kitchen / Garage / Bedroom / ... derived from whatever rooms are actually in use), so users can narrow the list spatially before scrolling or searching.

**Steps:**

1. Cheapest option: treat it as a convention over the existing `tags` array (e.g. a `room:kitchen` tag set by the user or suggested by the analyze prompt) rather than a new column — avoids a migration, and the `WhereIsFormComponent` tag UI already supports free entry.
2. If that feels too implicit, add a dedicated nullable `room` text column to `where_is_items` plus a small fixed suggestion list (recent/most-used rooms) in the form, rather than a fully open free-text field that fragments into near-duplicates ("Kitchen" vs "kitchen" vs "Kitchen cabinet").
3. On `where-is/page.tsx`, derive the distinct set of rooms from the loaded items and render them as filter chips above the search input, combinable with the existing text search (AND, not OR).
