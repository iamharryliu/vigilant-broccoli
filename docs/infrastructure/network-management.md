# Network Management

## DNS URLs

All public URLs for deployed applications, grouped by domain/provider.

```
harryliu.dev                              Cloudflare zone (Terraform: infrastructure/terraform/)
├── harryliu.dev                          Personal website — Cloudflare Pages (CNAME, proxied)
├── www.harryliu.dev                      301 redirect to apex (Cloudflare ruleset)
├── journal.harryliu.dev                  Journal — Cloudflare Pages `journal` (deployed from Gitea via cron-deploy-journal; owner-email Access + non-identity CI service token for cron-health-check origin probes)
├── git.harryliu.dev                      Gitea — OCI VM (A record, proxied + Cloudflare Access; web UI gated by owner email, git/CI over HTTPS via service token, git-SSH on :2222 direct)
├── code.harryliu.dev                     code-server — OCI VM (A record, proxied + Cloudflare Access; owner-email + non-identity CI service token for cron-health-check /healthz origin probes)
├── socket.harryliu.dev                   Socket server — OCI RabbitMQ VM (A record, DNS-only)
└── vault.harryliu.dev                    Vault — GCP vb-free-vm via cloudflared tunnel (CNAME, proxied + Cloudflare Access service token, CI-only)

cloud8skate.com                           Cloudflare Pages `cloud-8-skate-angular`
└── cloud8skate.com                       Cloud 8 Skate

fly.dev                                   Fly.io API services
├── staging-vb-express.fly.dev                 VB Express
├── staging-vb-llm-service.fly.dev             LLM Service
├── staging-vb-email-service.fly.dev           Email Service
├── staging-email-subscription-service.fly.dev Email Subscription Service
└── staging-vb-storage-service.fly.dev         Storage Service (bucket-service)

vercel.app                                Vercel
├── vb-hearth.vercel.app                  Hearth
├── employee-handler-ui.vercel.app        Employee Handler UI
├── findme-kohl.vercel.app                FindMe
└── whiteboard-one-psi.vercel.app         Whiteboard

github.io                                 GitHub Pages
└── iamharryliu.github.io/vigilant-broccoli   Pages index (pages-index/) + docs-md
```
