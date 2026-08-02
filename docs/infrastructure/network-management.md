# Network Management

Changes to network infrastructure (DNS records, domains/subdomains, proxying, tunnels, VPN) must be reflected here.

## DNS URLs

All public URLs for deployed applications, grouped by domain/provider.

```
harryliu.dev                              Cloudflare zone (Terraform: infrastructure/terraform/)
├── harryliu.dev                          Personal website — Cloudflare Pages `staging-harryliu-dev-react` (domain + CNAME: Terraform, infrastructure/terraform/)
├── www.harryliu.dev                      301 redirect to apex (Cloudflare ruleset)
├── journal.harryliu.dev                  Journal — Cloudflare Pages `staging-journal` (deployed from Gitea via cron-deploy-journal; owner-email Access + non-identity CI service token for ci-health-check origin probes)
├── docs.harryliu.dev                     Docs MD — Cloudflare Pages `staging-docs-md` (domain + CNAME: Terraform, infrastructure/terraform/; deployed via deploy.yml's deploy-apps job; public, no Access gating)
├── git.harryliu.dev                      Gitea — OCI VM (A record, proxied + Cloudflare Access; web UI gated by owner email, git/CI over HTTPS via service token, git-SSH on :2222 direct)
├── code.harryliu.dev                     code-server — OCI VM (A record, proxied + Cloudflare Access; owner-email + non-identity CI service token for ci-health-check /healthz origin probes)
├── drive.harryliu.dev                    Seafile — AWS EC2 VM (A record, proxied + Cloudflare Access, owner-email only; kept off the OCI Ampere pool — its 50GB-per-boot-volume floor left no free-tier storage headroom for a 4th/5th OCI VM)
├── socket.harryliu.dev                   Socket server — OCI RabbitMQ VM (A record, DNS-only)
└── vault.harryliu.dev                    Vault — GCP vb-free-vm via cloudflared tunnel (CNAME, proxied + Cloudflare Access service token, CI-only)

cloud8skate.com                           Cloudflare Pages `staging-cloud-8-skate-angular` (domain + CNAME: Terraform, infrastructure/terraform/)
└── cloud8skate.com                       Cloud 8 Skate

fly.dev                                   Fly.io API services (production apps created on first production dispatch)
├── staging-vb-express.fly.dev                    VB Express (staging)
└── production-vb-express.fly.dev                 VB Express (production)

vercel.app                                Vercel (production projects created on first production dispatch)
├── staging-hearth.vercel.app                 Hearth (staging)
├── production-hearth.vercel.app              Hearth (production)
├── staging-employee-handler-ui.vercel.app    Employee Handler UI (staging)
├── production-employee-handler-ui.vercel.app Employee Handler UI (production)
├── staging-findme.vercel.app                 FindMe (staging)
├── production-findme.vercel.app              FindMe (production)
├── staging-whiteboard.vercel.app             Whiteboard (staging)
└── production-whiteboard.vercel.app          Whiteboard (production)

pages.dev                                 Cloudflare Pages production aliases (staging projects serve the custom domains above)
├── production-cloud-8-skate-angular.pages.dev Cloud 8 Skate (production)
└── production-harryliu-dev-react.pages.dev    Personal website React (production)

github.io                                 GitHub Pages
└── iamharryliu.github.io/vigilant-broccoli   Pages index (pages-index/)
```

## Private-only Fly.io services

Reachable only over Fly's private 6PN network via a flycast address — no public IPv4/IPv6 allocated, so the `fly.dev` hostname resolves to nothing reachable. Each app has a private ingress IPv6 and `[http_service].force_https = false`, so the flycast edge serves the internal port over plain HTTP on port 80 (a `.internal` direct-machine dial would hit the app's IPv4-only `0.0.0.0` bind and reset; flycast routes through fly-proxy, which also auto-starts stopped machines).

IP allocation is automated, not manual: services flagged `privateOnly: true` in `scripts/secrets-mapping.config.ts` get their private IPv6 allocated and any public IP released by `deploy:secrets` on every deploy — see [fly-service-pattern.md](../api/deployment/fly-service-pattern.md).

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

CI e2e/security suites reach these from `ubuntu-latest` runners via the `.github/actions/fly-private-tunnel` composite action, which installs flyctl and opens a `flyctl proxy 3000:80 <app>.flycast -a <app>` WireGuard tunnel; the job then hits `http://127.0.0.1:3000`. Used by `test-e2e-llm.yml`, `test-security-llm.yml`, `test-e2e-storage-service.yml`, `test-security-storage-service.yml`, `test-smoke-email-service.yml`, `test-e2e-email-subscription-service.yml`, `test-security-email.yml`, `test-security-email-subscription-service.yml`. The job must also import `FLY_API_TOKEN` from Vault for flyctl to authenticate.

Locally-run apps need the same tunnel: `vb-manager-next` (pm2, not deployed) reaches bucket-service via `flyctl proxy 3001:80 staging-storage-service.flycast -a staging-storage-service` with `VB_STORAGE_SERVICE_URL=http://127.0.0.1:3001`, and reaches email-service via `flyctl proxy 3002:80 staging-vb-email-service.flycast -a staging-vb-email-service` with `EMAIL_SERVICE_URL=http://127.0.0.1:3002`. `small-business-next` (also local-only) needs the same email-service tunnel and `EMAIL_SERVICE_URL` pointed at it. Port 3001/3002, not 3000 — `nx serve vb-manager-next` runs `next dev` on 3000.

The storage-service and llm-service apps dropped their `vb-` prefix (old: `<env>-vb-storage-service`, `<env>-vb-llm-service`). Fly has no rename, so these are new apps; the originals were destroyed after cutover. Only deployed instances carry the `<env>-` prefix — the nx projects stay `bucket-service` and `llm-service`.

The llm rename is a two-app cutover, unlike storage: `LLM_SERVICE_URL` is baked into vb-express's `[env]`, so the new llm app must exist and be deployed **before** vb-express redeploys against the new flycast host, or vb-express's LLM routes 502 against a name that doesn't resolve.
