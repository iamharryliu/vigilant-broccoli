# Network Management

## DNS URLs

All public URLs for deployed applications, grouped by domain/provider.

```
harryliu.dev                              Cloudflare zone (Terraform: infrastructure/terraform/)
├── harryliu.dev                          Personal website — Cloudflare Pages `staging-harryliu-dev-angular` (domain + CNAME: Terraform, infrastructure/terraform/)
├── www.harryliu.dev                      301 redirect to apex (Cloudflare ruleset)
├── journal.harryliu.dev                  Journal — Cloudflare Pages `staging-journal` (deployed from Gitea via cron-deploy-journal; owner-email Access + non-identity CI service token for cron-health-check origin probes)
├── git.harryliu.dev                      Gitea — OCI VM (A record, proxied + Cloudflare Access; web UI gated by owner email, git/CI over HTTPS via service token, git-SSH on :2222 direct)
├── code.harryliu.dev                     code-server — OCI VM (A record, proxied + Cloudflare Access; owner-email + non-identity CI service token for cron-health-check /healthz origin probes)
├── socket.harryliu.dev                   Socket server — OCI RabbitMQ VM (A record, DNS-only)
└── vault.harryliu.dev                    Vault — GCP vb-free-vm via cloudflared tunnel (CNAME, proxied + Cloudflare Access service token, CI-only)

cloud8skate.com                           Cloudflare Pages `staging-cloud-8-skate-angular` (domain + CNAME: Terraform, infrastructure/terraform/)
└── cloud8skate.com                       Cloud 8 Skate

fly.dev                                   Fly.io API services (production apps created on first production dispatch)
├── staging-vb-express.fly.dev                    VB Express (staging)
├── production-vb-express.fly.dev                 VB Express (production)
├── staging-vb-llm-service.fly.dev                LLM Service (staging)
├── production-vb-llm-service.fly.dev             LLM Service (production)
├── staging-vb-email-service.fly.dev              Email Service (staging)
├── production-vb-email-service.fly.dev           Email Service (production)
├── staging-email-subscription-service.fly.dev    Email Subscription Service (staging)
├── production-email-subscription-service.fly.dev Email Subscription Service (production)
├── staging-vb-storage-service.fly.dev            Storage Service (staging, bucket-service)
└── production-vb-storage-service.fly.dev         Storage Service (production, bucket-service)

vercel.app                                Vercel (production projects created on first production dispatch)
├── staging-vb-hearth.vercel.app              Hearth (staging)
├── production-vb-hearth.vercel.app           Hearth (production)
├── staging-employee-handler-ui.vercel.app    Employee Handler UI (staging)
├── production-employee-handler-ui.vercel.app Employee Handler UI (production)
├── staging-findme.vercel.app                 FindMe (staging)
├── production-findme.vercel.app              FindMe (production)
├── staging-whiteboard.vercel.app             Whiteboard (staging)
└── production-whiteboard.vercel.app          Whiteboard (production)

pages.dev                                 Cloudflare Pages production aliases (staging projects serve the custom domains above)
├── production-cloud-8-skate-angular.pages.dev Cloud 8 Skate (production)
├── production-harryliu-dev-react.pages.dev    Personal website React (production)
└── production-harryliu-dev-angular.pages.dev  Personal website Angular (production)

github.io                                 GitHub Pages
└── iamharryliu.github.io/vigilant-broccoli   Pages index (pages-index/) + docs-md
```
