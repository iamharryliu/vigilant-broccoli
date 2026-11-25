# Network Management

Changes to network infrastructure (DNS records, domains/subdomains, proxying, tunnels, VPN) must be reflected here.

## Table of Contents

- [DNS URLs](#dns-urls)
- [Staging UI custom domains](#staging-ui-custom-domains)
- [Tailnet](#tailnet)
- [Private-only Fly.io services](#private-only-flyio-services)

## DNS URLs

All public URLs for deployed applications, grouped by domain/provider. Staging UI browser access is gated; see [staging monitoring](./upptime.md#staging-ui-access).

The site zones are single values: `VB_APP_DOMAIN`, `HARRYLIU_DOMAIN` and `CLOUD8SKATE_DOMAIN` in `libs/@vigilant-broccoli/infrastructure/src/lib/app.consts.ts`, and `vigilant_broccoli_domain`, `harryliu_dev_domain` and `cloud8skate_domain` in `infrastructure/terraform/variables.tf`. Change each constant together with its variable. To move a host between zones, edit the zone it is built from in both places. Full-hostname variable defaults (`docs_domain`, `career_domain`, …) stay literal.

```
harryliu.dev                              Cloudflare zone (Terraform: infrastructure/terraform/)
├── harryliu.dev                          Personal website — Cloudflare Pages `production-harryliu-dev-react` (domain + CNAME: Terraform, infrastructure/terraform/)
├── projects.vigilant-broccoli.app        GitHub Pages index (CNAME to iamharryliu.github.io in the `vigilant-broccoli.app` zone, DNS-only: Terraform `cloudflare-projects.tf`; also the upstream of `status.vigilant-broccoli.app`, `career.harryliu.dev`, `deployments.vigilant-broccoli.app` and `games.vigilant-broccoli.app`, so it must stay DNS-only; the Pages custom domain is set by `github_repository_pages` in `github.tf`; the CNAME file staged by `project-overview:deploy-github-pages` keeps deploys from clearing it)
├── career.harryliu.dev                   Career links — the project-overview `CareerPage` at the host root (resume, career experience note, profile links). Same `status-proxy` Worker and Terraform file as `status.vigilant-broccoli.app` (second custom domain, `career_domain`); the app picks `CareerPage` because `window.location.hostname` is this host
├── games.vigilant-broccoli.app           Games collection — project-overview GamesPage at root and #/games, using the existing status-proxy Worker (fourth custom domain, in the `vigilant-broccoli.app` zone via `vb_app_domains.games` in cloudflare-status.tf); membership comes from the shared applications registry
├── uptime.vigilant-broccoli.app          Upptime historical site — GitHub Pages `gh-pages` branch of `iamharryliu/uptime` (CNAME to iamharryliu.github.io in the `vigilant-broccoli.app` zone, DNS-only: Terraform `github-upptime.tf`; Pages custom domain set by `github_repository_pages.upptime`; see [upptime.md](./upptime.md))
├── api.vigilant-broccoli.app                      VB Express (production) — proxied CNAME to `production-vb-express.fly.dev` (Terraform `cloudflare-vb-express.tf`); the fly app needs a matching cert, which the `deploy.yml` "Ensure fly cert" step adds idempotently (`flyctl certs add api.vigilant-broccoli.app -a production-vb-express`) so Cloudflare's origin TLS handshake succeeds. All production clients and Upptime use this hostname
├── staging-api.vigilant-broccoli.app              VB Express (staging) — proxied CNAME to `staging-vb-express.fly.dev` (Terraform `cloudflare-vb-express.tf`); same `deploy.yml` cert step (`flyctl certs add staging-api.vigilant-broccoli.app -a staging-vb-express`). Exists so `*.vigilant-broccoli.app` Better Auth clients (sandbox) get same-site cookies, which `fly.dev`, a public suffix, cannot give; Upptime and quick links use it, while calendars and photography staging still call the fly.dev host
├── www.harryliu.dev                      301 redirect to apex (Cloudflare ruleset)
├── projects.harryliu.dev                 301 redirect to projects.vigilant-broccoli.app, path and query preserved (proxied CNAME + `projects_to_vigilant_broccoli` rule in the zone's redirect ruleset, `cloudflare-harryliu-dev.tf`; hash routes survive because browsers carry the fragment across redirects)
├── findme.vigilant-broccoli.app          FindMe — Cloudflare Pages `production-findme` (domain + CNAME in the `vigilant-broccoli.app` zone: Terraform `cloudflare-collaboration-apps.tf`)
├── tasks.harryliu.dev                    Tasks — Vercel `production-tasks-next` (CNAME to cname.vercel-dns.com, DNS-only: Terraform, infrastructure/terraform/; domain also added on the Vercel project; `frame-ancestors` limited to the manager apps)
├── balloono.vigilant-broccoli.app        Balloono — Vercel `production-balloono` (CNAME to cname.vercel-dns.com in the `vigilant-broccoli.app` zone, DNS-only: Terraform `cloudflare-vercel-apps.tf`; domain also added on the Vercel project; online rooms run over public Supabase Realtime channels, no backend of its own)
├── manager.harryliu.dev                  Mobile Manager Next — Vercel `production-vb-manager-next-mobile` (CNAME to cname.vercel-dns.com, DNS-only: Terraform, infrastructure/terraform/; domain also added on the Vercel project; gated by Vercel Authentication)
├── chat.harryliu.dev                     Chat — Vercel `production-chat` (CNAME to cname.vercel-dns.com, DNS-only: Terraform, infrastructure/terraform/; domain also added on the Vercel project; gated by Vercel Authentication)
├── staging-chat.harryliu.dev             Chat (staging) — same as `chat.harryliu.dev` on `staging-chat`
├── hearth.harryliu.dev                   Hearth — Vercel `production-hearth` (CNAME to cname.vercel-dns.com, DNS-only: Terraform, infrastructure/terraform/; domain also added on the Vercel project; public, sign-in via Supabase)
├── bookmarks.vigilant-broccoli.app       Bookmarks — Cloudflare Pages `production-bookmarks-react` (domain + CNAME in the `vigilant-broccoli.app` zone, looked up by name: Terraform `cloudflare-bookmarks.tf`; browser-local data, no backend or auth; no redirect from the old `bookmarks.harryliu.dev`)
├── photography.harryliu.dev              Photography — Cloudflare Pages `production-photography-react` (domain + CNAME: Terraform `cloudflare-photography.tf`; public, no Access gating; albums and photo bytes come from VB Express `GET /api/public/photography/*` at `api.vigilant-broccoli.app` (staging Pages → `staging-vb-express.fly.dev`), allowed by the same narrowly scoped public-prefix CORS rule as Calendars; content is the `photography/` folder of the default R2 bucket, managed in local-manager `/cms`)
├── pomodoro.vigilant-broccoli.app                 Pomodoro — Cloudflare Pages `production-pomodoro-react` (domain + CNAME: Terraform `cloudflare-pomodoro.tf`; browser-local settings, no backend or auth)
├── sandbox.vigilant-broccoli.app                  Sandbox — Cloudflare Pages `production-sandbox` (single environment deployed from `main`, no staging; domain + CNAME + owner-email-only Cloudflare Access also covering `production-sandbox.pages.dev` and its aliases: Terraform `cloudflare-sandbox.tf`; Google sign-in test against staging VB Express Better Auth at `staging-api.vigilant-broccoli.app`, whose credentialed CORS for this origin is scoped to `/api/auth/`)
├── docs.harryliu.dev                      Docs MD — Cloudflare Pages `production-docs-md` (domain + CNAME: Terraform, infrastructure/terraform/; deployed by deploy.yml, which maps `notes/**` changes to it because the notes snapshot lives outside the nx graph; public, no Access gating)
├── grind-75.vigilant-broccoli.app                 Grind 75 — Cloudflare Pages `production-grind-75-react` (domain + CNAME: Terraform `cloudflare-grind-75.tf`; deployed by deploy.yml, which maps `projects/grind-75/**` changes to it because the solutions snapshot lives outside the nx graph; public, no Access gating)
├── context.vigilant-broccoli.app                  Agent Context — Cloudflare Pages `production-context-md` (domain + CNAME: Terraform, infrastructure/terraform/; deployed by deploy.yml, which maps agent-context changes to it because the agent-context snapshot lives outside the nx graph; public, no Access gating)
├── status.vigilant-broccoli.app            Status summary — the project-overview `StatusPage` at the host root. Cloudflare Worker `status-proxy` (`infrastructure/cloudflare-workers/status-proxy/`, custom domain in the `vigilant-broccoli.app` zone, hostname from `vb_app_domains`, + script: Terraform `cloudflare-status.tf`; Cloudflare creates the DNS record; no redirect from the old `harryliu.dev` host) reverse-proxies GET/HEAD to `projects.vigilant-broccoli.app`, rewrites upstream redirect `Location`s to the status host and passes status codes and content types through. The app picks `StatusPage` because `window.location.hostname` is this host — a URL fragment never reaches the network, so no proxy could select the route
├── deployments.vigilant-broccoli.app       Preview deployments — the project-overview `DeploymentsPage` at the host root (open PRs with a deployed Cloudflare Pages preview, fetched client-side from the GitHub API without a token). Same `status-proxy` Worker and Terraform file as `status.vigilant-broccoli.app` (custom domain in the `vigilant-broccoli.app` zone, hostname from `vb_app_domains`); the app picks `DeploymentsPage` because `window.location.hostname` is this host
├── components.vigilant-broccoli.app        Component Library — Cloudflare Pages `production-component-library` (domain + CNAME: Terraform, infrastructure/terraform/; public, no Access gating).
├── calendar.harryliu.dev                 Calendars — Cloudflare Pages `production-calendars` (domain + CNAME: Terraform, infrastructure/terraform/; public, no Access gating; lists public event calendars from VB Express `GET /api/public/event-calendars` at `api.vigilant-broccoli.app` (staging Pages → `staging-vb-express.fly.dev`), allowed by a narrowly scoped CORS rule on that route only)
├── notepad.vigilant-broccoli.app                  Notepad — Cloudflare Pages `production-notepad-react` (domain + CNAME: Terraform `cloudflare-notepad.tf`; public, no Access gating; notes stay in the browser's `localStorage`, no backend)
├── text-tools.vigilant-broccoli.app               Text Tools UI — Cloudflare Pages `production-text-tools-ui` (domain + CNAME: Terraform `cloudflare-text-tools.tf`; public, no Access gating; embedded by the manager Dev Dashboard via `frame-ancestors`)
├── utilities.vigilant-broccoli.app                Utilities UI — Cloudflare Pages `production-utilities-ui` (domain + CNAME: Terraform, infrastructure/terraform/; public, no Access gating)
├── waiting.vigilant-broccoli.app                  Waiting Games — Cloudflare Pages `production-waiting-games` (domain + CNAME: Terraform, infrastructure/terraform/; public, no Access gating; stateless passive games, no backend)
├── gravity-guy.vigilant-broccoli.app       Gravity Guy — Vercel `production-gravity-guy` (CNAME to cname.vercel-dns.com, DNS-only, in the `vigilant-broccoli.app` zone: Terraform `cloudflare-vercel-apps.tf`; domain also added on the Vercel project; stateless, browser-local settings and scores)
├── weather.vigilant-broccoli.app         Weather — Vercel `production-weather-next` (CNAME to cname.vercel-dns.com in the `vigilant-broccoli.app` zone, DNS-only: Terraform `cloudflare-vercel-apps.tf`; domain also added on the Vercel project; no redirect from the old `harryliu.dev` hosts)
├── whiteboard.vigilant-broccoli.app               Whiteboard — Cloudflare Pages `production-whiteboard` (domain + CNAME: Terraform `cloudflare-whiteboard.tf`; live rooms over Supabase Realtime, no sign-in)
├── git.vigilant-broccoli.app                      Gitea — OCI VM (A record, proxied + Cloudflare Access; web UI gated by owner email, git/CI over HTTPS via service token, git-SSH on :2222 direct). Also the read surface for the private journal notes — browsed directly in Gitea rather than mirrored to a Pages site, so the notes never leave the VM
├── code.vigilant-broccoli.app                     code-server — OCI VM (A record, proxied + Cloudflare Access; owner-email + non-identity CI service token for ci-health-check /healthz origin probes)
├── shell.vigilant-broccoli.app                    Web terminal — same OCI VM and Caddy as code-server, served by the `web-terminal` s6 service in the code-server image on internal port 7681, never published on the host (A record, proxied + its own owner-only Cloudflare Access application with a 4h session; the server re-verifies the Access JWT on every request and WebSocket upgrade; Terraform `oci-code-server.tf`)
├── drive.harryliu.dev                    Seafile — AWS EC2 VM (A record, proxied + Cloudflare Access, owner-email only; kept off the OCI Ampere pool — its 50GB-per-boot-volume floor left no free-tier storage headroom for a 4th/5th OCI VM)
├── images.harryliu.dev                   Immich — AWS EC2 VM (CNAME to cfargotunnel.com, proxied + Cloudflare Access owner-email only; reached via an outbound-only cloudflared tunnel like vault.vigilant-broccoli.app, not a direct A record like drive — no inbound 80/443 on the box at all)
├── grafana.vigilant-broccoli.app                  Grafana — AWS EC2 observability VM (`aws-grafana.tf`; CNAME to cfargotunnel.com, proxied + Cloudflare Access owner-email only; same tunnel pattern as images)
├── loki.vigilant-broccoli.app                     Loki push endpoint — same VM and tunnel as grafana (CNAME, proxied, **no Access app**: nginx basic auth on `/loki/api/v1/push`, unauthenticated `/health` (VM liveness, polled by Upptime) and `/ready`, everything else 404; client is the `vb-log-shipper` fly app. Access is not usable here — the shipper is Vector, whose Loki sink supports only basic/bearer auth, not the `CF-Access-Client-Id`/`Secret` header pair)
├── queue.vigilant-broccoli.app                    RabbitMQ management UI — OCI RabbitMQ VM (`oci.tf`; CNAME to cfargotunnel.com, proxied + Cloudflare Access owner-email only; cloudflared runs in the VM's Compose stack and reaches `https://rabbitmq:15671` over the private-CA cert, so 15671 is not published or open in the security list)
├── socket.vigilant-broccoli.app                   Socket server — OCI RabbitMQ VM (A record, DNS-only)
└── vault.vigilant-broccoli.app                    Vault — GCP vb-free-vm via cloudflared tunnel (CNAME, proxied + Cloudflare Access service token, CI-only)

cloud8skate.com                           Cloudflare Pages `production-cloud-8-skate-react` (domain + CNAME: Terraform, infrastructure/terraform/)
└── cloud8skate.com                       Cloud 8 Skate

fly.dev                                   Fly.io API services (production apps created on first production dispatch)
├── demo-office-presence-service.fly.dev          Office Presence Service (demo only) — Slack Events API Request URLs and the demo UI API
├── staging-vb-express.fly.dev                    VB Express (staging) — origin behind `staging-api.vigilant-broccoli.app`
├── production-vb-express.fly.dev                 VB Express (production) — origin behind `api.vigilant-broccoli.app`; clients should not call it directly
└── vb-log-shipper                                Fly log shipper (no hostname, no public IP — outbound only: Fly NATS log stream → https://loki.vigilant-broccoli.app)

vercel.app                                Vercel (production projects created on first production dispatch)
├── staging-hearth.vercel.app                 Hearth (staging)
├── production-hearth.vercel.app              Hearth (production)
├── demo-employee-handler-ui.vercel.app       Employee Handler UI (demo — its only Vercel deploy)
├── staging-weather-next.vercel.app    Weather (staging)
├── production-weather-next.vercel.app Weather (production)
├── staging-tasks-next.vercel.app      Tasks (staging)
├── production-tasks-next.vercel.app   Tasks (production)
├── staging-balloono.vercel.app               Balloono (staging)
├── production-balloono.vercel.app            Balloono (production)
├── staging-gravity-guy.vercel.app            Gravity Guy (staging)
├── production-gravity-guy.vercel.app         Gravity Guy (production origin)
├── staging-chat.vercel.app                   Chat (staging)
└── production-chat.vercel.app                Chat (production origin)

pages.dev                                 Cloudflare Pages provider aliases (retained alongside custom domains)
├── staging-bookmarks-react.pages.dev         Bookmarks (staging, Cloudflare Access)
├── production-bookmarks-react.pages.dev      Bookmarks (production origin)
├── preview-bookmarks-react.pages.dev         Bookmarks (PR previews)
├── staging-photography-react.pages.dev       Photography (staging, Cloudflare Access)
├── production-photography-react.pages.dev    Photography (production origin)
├── staging-pomodoro-react.pages.dev          Pomodoro (staging, Cloudflare Access)
├── production-pomodoro-react.pages.dev       Pomodoro (production origin)
├── preview-pomodoro-react.pages.dev          Pomodoro (PR previews)
├── production-sandbox.pages.dev              Sandbox (production origin, Cloudflare Access)
├── demo-office-presence-ui.pages.dev        Office Presence UI (demo only — its only deploy)
├── staging-findme.pages.dev                 FindMe (staging)
├── production-findme.pages.dev              FindMe (production)
├── staging-whiteboard.pages.dev                 Whiteboard (staging)
├── production-whiteboard.pages.dev              Whiteboard (production)
├── staging-cloud-8-skate-react.pages.dev      Cloud 8 Skate (staging — staging.cloud8skate.com; cloud8skate.com is on production)
└── staging-harryliu-dev-react.pages.dev       Personal website React (staging — harryliu.dev is on production)

github.io                                 GitHub Pages (custom domain projects.vigilant-broccoli.app)
└── iamharryliu.github.io                     Pages origin for projects.vigilant-broccoli.app (project-overview/)
```

## Staging UI custom domains

| Production hostname | Staging hostname | Existing staging project | Provider |
| --- | --- | --- | --- |
| balloono.vigilant-broccoli.app | staging-balloono.vigilant-broccoli.app | `staging-balloono` | Vercel |
| bookmarks.vigilant-broccoli.app | staging-bookmarks.vigilant-broccoli.app | `staging-bookmarks-react` | Pages |
| calendar.harryliu.dev | staging-calendar.harryliu.dev | `staging-calendars` | Pages |
| chat.harryliu.dev | staging-chat.harryliu.dev | `staging-chat` | Vercel |
| cloud8skate.com | staging.cloud8skate.com | `staging-cloud-8-skate-react` | Pages |
| components.vigilant-broccoli.app | staging-components.vigilant-broccoli.app | `staging-component-library` | Pages |
| context.vigilant-broccoli.app | staging-context.vigilant-broccoli.app | `staging-context-md` | Pages |
| docs.harryliu.dev | staging-docs.harryliu.dev | `staging-docs-md` | Pages |
| findme.vigilant-broccoli.app | staging-findme.vigilant-broccoli.app | `staging-findme` | Pages |
| gravity-guy.vigilant-broccoli.app | staging-gravity-guy.vigilant-broccoli.app | `staging-gravity-guy` | Vercel |
| grind-75.vigilant-broccoli.app | staging-grind-75.vigilant-broccoli.app | `staging-grind-75-react` | Pages |
| harryliu.dev | staging.harryliu.dev | `staging-harryliu-dev-react` | Pages |
| hearth.harryliu.dev | staging-hearth.harryliu.dev | `staging-hearth` | Vercel |
| manager.harryliu.dev | staging-manager.harryliu.dev | `staging-vb-manager-next-mobile` | Vercel |
| photography.harryliu.dev | staging-photography.harryliu.dev | `staging-photography-react` | Pages |
| pomodoro.vigilant-broccoli.app | staging-pomodoro.vigilant-broccoli.app | `staging-pomodoro-react` | Pages |
| projects.vigilant-broccoli.app | staging-projects.vigilant-broccoli.app | `staging-project-overview` | Pages |
| tasks.harryliu.dev | staging-tasks.harryliu.dev | `staging-tasks-next` | Vercel |
| notepad.vigilant-broccoli.app | staging-notepad.vigilant-broccoli.app | `staging-notepad-react` | Pages |
| text-tools.vigilant-broccoli.app | staging-text-tools.vigilant-broccoli.app | `staging-text-tools-ui` | Pages |
| utilities.vigilant-broccoli.app | staging-utilities.vigilant-broccoli.app | `staging-utilities-ui` | Pages |
| waiting.vigilant-broccoli.app | staging-waiting.vigilant-broccoli.app | `staging-waiting-games` | Pages |
| weather.vigilant-broccoli.app | staging-weather.vigilant-broccoli.app | `staging-weather-next` | Vercel |
| whiteboard.vigilant-broccoli.app | staging-whiteboard.vigilant-broccoli.app | `staging-whiteboard` | Pages |

These are configured destinations, requiring the post-merge activation below; this inventory does not assert live DNS or certificate readiness. Provider aliases remain available and protected. `staging.cloud8skate.com` lives in the separate `cloud8skate.com` zone (`cloudflare-cloud8skate.tf`) and its Sanity CORS origin and reCAPTCHA domain are dashboard settings outside this repo. Infrastructure/API hosts, demos and dedicated previews have no new staging domain. `staging-projects` serves `staging-project-overview` only; `projects.vigilant-broccoli.app` and the `status-proxy` hosts stay on GitHub Pages until the production hostnames move to `production-project-overview`.

After merging, run from the updated repository:

1. Ensure the existing staging projects have deployments. For Vercel, a staging deploy enables Vercel Authentication with `deploymentType: all`; domain sync also enforces this before attachment. Do not rename projects, including `staging-vb-manager-next-mobile`.
2. Run `pnpm tf:plan`, review the DNS/domain additions, Access destination additions, Supabase callback additions and Hearth R2 CORS changes, then `pnpm tf:apply`. Pages attachments and proxied CNAMEs depend on Access application updates. The automatic post-apply step reads both Vercel outputs, protects staging projects and attaches their hosts; it retains the production output keys. If domain sync needs retrying, run `pnpm tf:post-apply` after resolving the error.
3. Redeploy staging Hearth and the personal website to bake in their new frontend URLs, and staging VB Express for the personal-site and public-calendar CORS additions: run `gh workflow run manual-deploy-app --ref main -f project=<project> -f environment=staging` for `hearth`, `personal-website-react` and `vb-express`, and wait for success. Existing per-environment API configuration stays on staging Fly backends. The shared Supabase project remains shared; new exact `/auth/callback` entries retain all provider callbacks.
4. Wait for DNS and provider certificate issuance. Check every custom host and retained provider alias anonymously with `curl -sS -D - -o /dev/null https://<host>/` (do not follow redirects): expect HTTP 302 to Cloudflare Access or Vercel SSO, never application content. Also check immutable staging aliases remain protected. Run `gh workflow run test-security-cloudflare-access --ref main` to check the existing Pages provider and custom hosts.
5. In an owner browser session, verify each app loads; test Hearth, Balloono and Manager OAuth callbacks at the custom hosts, Hearth invitations and R2 uploads, the personal contact form including reCAPTCHA, and Calendars' public data request. Confirm requests still target staging backends. reCAPTCHA domain acceptance and all live behavior require verification; no dashboard changes are part of this configuration PR.
6. Run `gh workflow run ci-sync-upptime --ref main` only after activation, then `gh workflow run cron-upptime -R iamharryliu/uptime` and `gh workflow run cron-upptime-response-time -R iamharryliu/uptime`. Source URL changes retain site names/history and 302 expectations; no monitoring bypass credentials are needed. The merge-triggered config sync may precede apply, so temporary failing probes are possible. Check Project Overview staging cards, shared browser quick links and deployment summaries.

## Tailnet

Private mesh (Tailscale, `echidna-rohu.ts.net`) — WireGuard between the owner's
own devices, addressed by MagicDNS. Nothing here has a DNS record in the table
above, no port is forwarded on the home router, and none of it is reachable
from the internet. It is not a replacement for the cloudflared + Access pattern:
that one is for services a browser should reach from anywhere, this one is for
services only the owner's devices need.

```
jellyfin-pi.echidna-rohu.ts.net:8096   Jellyfin — Raspberry Pi on the home LAN (`infrastructure/jellyfin-pi/`, Ansible-provisioned, no Terraform). MagicDNS only: native clients (Android TV, iOS, Kodi) cannot complete a Cloudflare Access login. The node enrols non-interactively with the reusable `TAILSCALE_AUTH_KEY` from Vault; see [jellyfin-pi.md](./jellyfin-pi.md)
```

`local-manager-next`'s dev dashboard lists the tailnet's machines through the
Tailscale API (`TAILSCALE_API_KEY`), so what is currently enrolled is visible
there rather than only in the admin console.

## Private-only Fly.io services

Reachable only over Fly's private 6PN network via a flycast address — no public IPv4/IPv6 allocated, so the `fly.dev` hostname resolves to nothing reachable. Each app has a private ingress IPv6 and `[http_service].force_https = false`, so the flycast edge serves the internal port over plain HTTP on port 80 (a `.internal` direct-machine dial would hit the app's IPv4-only `0.0.0.0` bind and reset; flycast routes through fly-proxy, which also auto-starts stopped machines).

IP allocation is automated, not manual: services flagged `privateOnly: true` in `scripts/secrets-mapping.config.ts` get their private IPv6 allocated and any public IP released by `deploy:secrets` on every deploy — see [fly-service-pattern.md](../app-development/api/deployment/fly-service-pattern.md).

```
staging-llm-service.flycast                    LLM Service (staging) — called by staging-vb-express via http://…flycast over 6PN
production-llm-service.flycast                 LLM Service (production) — called by production-vb-express via http://…flycast over 6PN
staging-storage-service.flycast                Storage Service (staging, bucket-service) — no in-fly caller; CI + local dev only
production-storage-service.flycast             Storage Service (production, bucket-service) — no in-fly caller; CI + local dev only
staging-vb-email-service.flycast               Email Service (staging) — called by staging-vb-express and staging-email-subscription-service over 6PN; Vercel apps (hearth) reach it through vb-express's `POST /api/messaging/send-email` gateway route instead of hitting it directly
production-vb-email-service.flycast            Email Service (production) — same, via production-vb-express
staging-email-subscription-service.flycast     Email Subscription Service (staging) — no in-fly caller; CI + local dev only
production-email-subscription-service.flycast  Email Subscription Service (production) — no in-fly caller; CI + local dev only
```

CI e2e/security suites reach these from GitHub-hosted Ubuntu runners via the `.github/actions/fly-private-tunnel` composite action, which installs flyctl and opens a `flyctl proxy 3000:80 <app>.flycast -a <app>` WireGuard tunnel; the job then hits `http://127.0.0.1:3000`. Used by `test-e2e-llm.yml`, `test-security-llm.yml`, `test-e2e-storage-service.yml`, `cron-cleanup-ci-test-fixtures.yml`, `test-security-storage-service.yml`, `test-smoke-email-service.yml`, `test-e2e-email-subscription-service.yml`, `test-security-email.yml`, `test-security-email-subscription-service.yml`. The job must also import `FLY_API_TOKEN` from Vault for flyctl to authenticate.

`local-manager-next` (pm2, not deployed) needs no tunnel: its storage and email demos call public vb-express (`/api/storage/*`, `/api/messaging/send-email`), which forwards over 6PN. `small-business-next` (also local-only) still calls email-service directly, so it needs `flyctl proxy 3002:80 staging-vb-email-service.flycast -a staging-vb-email-service` with `EMAIL_SERVICE_URL=http://127.0.0.1:3002`.

The storage-service and llm-service apps dropped their `vb-` prefix (old: `<env>-vb-storage-service`, `<env>-vb-llm-service`). Fly has no rename, so these are new apps; the originals were destroyed after cutover. Only deployed instances carry the `<env>-` prefix — the nx projects stay `bucket-service` and `llm-service`.

The llm rename is a two-app cutover, unlike storage: `LLM_SERVICE_URL` is baked into vb-express's `[env]`, so the new llm app must exist and be deployed **before** vb-express redeploys against the new flycast host, or vb-express's LLM routes 502 against a name that doesn't resolve.
