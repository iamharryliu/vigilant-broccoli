# Fork Identity Inventory

Hardcoded identity and account values a fork must change, plus values that must stay literal and personal content that is not config.

## Table of Contents

- [Base Values](#base-values)
- [Cloudflare](#cloudflare)
- [Docker Registry](#docker-registry)
- [Email Addresses](#email-addresses)
- [Fly.io](#flyio)
- [GCP](#gcp)
- [GitHub](#github)
- [Other Cloud and SaaS](#other-cloud-and-saas)
- [Public Hostnames and Domains](#public-hostnames-and-domains)
- [Terraform Cloud](#terraform-cloud)
- [Vault](#vault)
- [Vercel](#vercel)
- [Literal Values and Personal Content](#literal-values-and-personal-content)

## Base Values

| Value kind | Base value | Details |
| --- | --- | --- |
| AWS account | `841376026547` | [Other Cloud and SaaS](#other-cloud-and-saas) |
| Cloudflare account id | `26d066ec62c4d27b8da5e9aebac17293` | [Cloudflare](#cloudflare) |
| Cloudflare zone id | `6cb0ddc52a5da0094c589bdf7adc16ad` | [Cloudflare](#cloudflare) |
| Docker Hub namespace | `iamharryliu` | [Docker Registry](#docker-registry) |
| Fly.io organization | `personal` | [Fly.io](#flyio) |
| GCP project id | `vigilant-broccoli` | [GCP](#gcp) |
| GCP project number | `88091895337` | [GCP](#gcp) |
| GitHub owner | `iamharryliu` | [GitHub](#github) |
| GitHub repository | `vigilant-broccoli` | [GitHub](#github) |
| Local dev domain | `vigilant-broccoli.app` | [Public Hostnames and Domains](#public-hostnames-and-domains) |
| npm scope | `@vigilant-broccoli` | [GitHub](#github) |
| Owner email | `harryliu1995@gmail.com` | [Email Addresses](#email-addresses), [Literal Values](#literal-values-and-personal-content) |
| Primary domain | `harryliu.dev` | [Public Hostnames and Domains](#public-hostnames-and-domains) |
| Second-level site domain | `cloud8skate.com` | [Public Hostnames and Domains](#public-hostnames-and-domains) |
| Supabase project ref | `jrdosjjgmsoodpjmjqxx` | [Other Cloud and SaaS](#other-cloud-and-saas) |
| Tailscale tailnet | `echidna-rohu.ts.net` | [Other Cloud and SaaS](#other-cloud-and-saas) |
| Terraform Cloud organization | `vigilant-broccoli` | [Terraform Cloud](#terraform-cloud) |
| Terraform Cloud workspace | `vigilant-broccoli-infrastructure` | [Terraform Cloud](#terraform-cloud) |
| Vercel team id | `team_K8XGLgKfYA0WKlMX80jaVSvg` | [Vercel](#vercel) |

## Cloudflare

| Value kind | Example value found | Files/locations (count + representative paths) | Consumed by | Notes |
| --- | --- | --- | --- | --- |
| Access applications | `vault`, `gitea`, `code-server`, `web-terminal`, `seafile`, `immich`, `grafana`, `rabbitmq`, staging Pages | 9 resources: `infrastructure/terraform/cloudflare-vault.tf`, `cloudflare-gitea.tf`, `cloudflare-staging-ui.tf`, `oci-code-server.tf`, `aws-*.tf` | Terraform | Domains come from `*_domain` variables; allowed emails are listed under [Literal Values](#literal-values-and-personal-content). |
| Access service tokens | `vault-ci`, `gitea-ci`, `code-server-ci` | 3 resources in `infrastructure/terraform/cloudflare-vault.tf`, `cloudflare-gitea.tf`, `oci-code-server.tf` | Terraform, workflow | Client id/secret land in Secret Manager as `VAULT_CF_ACCESS_CLIENT_*`; token values are not in the tree. |
| Account id | `26d066ec62c4d27b8da5e9aebac17293` | 4 files: `infrastructure/terraform/variables.tf` (`cloudflare_account_id`), `docs/infrastructure/secret-management.md`, `libs/@vigilant-broccoli/private-infrastructure/src/lib/account.consts.ts`, `vb-manager-next/.../wrangler-pages.component.tsx` | Terraform, code, docs | Terraform passes it to ~50 resources through `var.cloudflare_account_id`; the dashboard links embed it directly. |
| Pages projects | `production-`/`staging-`/`preview-` + `bookmarks-react`, `calendars`, `docs-md`, `harryliu-dev-react`, … | 11 files: `apps/ui/*/project.json` (`--project-name`), `infrastructure/terraform/variables.tf` (`*_pages_project`, `*_pages_subdomain`) | code (Nx targets), Terraform | `*.pages.dev` subdomains are globally unique, so a fork must pick new project names. |
| R2 buckets | `vigilant-broccoli`, `storage-buckets`, `nx-cache`, `vibecheck-bucket`, `home-docs`, `where-is` | `infrastructure/terraform/main.tf`, `cloudflare-nx-cache.tf` | Terraform, code | Bucket names are account-scoped, so a fork can usually keep them. |
| Tunnels | `vault`, `immich`, `grafana`, `rabbitmq` | 4 resources in `infrastructure/terraform/cloudflare-vault.tf`, `aws-immich.tf`, `aws-grafana.tf`, `oci.tf` | Terraform | Tunnel tokens are stored in Secret Manager (`VB_VM_CLOUDFLARED_TUNNEL_TOKEN`) and Vault. |
| Workers | `nx-cache`, `status-proxy` | `infrastructure/cloudflare-workers/*/index.js`, `infrastructure/terraform/cloudflare-nx-cache.tf`, `cloudflare-status.tf` | Terraform, code | `status-proxy` hardcodes the upstream status hostnames. |
| Zero Trust team domain | `vigilant-broccoli.cloudflareaccess.com` | 1 file: `infrastructure/terraform/variables.tf` (`access_team_domain`), read by `oci-code-server.tf` | Terraform |
| Zone id (`harryliu.dev`) | `6cb0ddc52a5da0094c589bdf7adc16ad` | 1 file: `infrastructure/terraform/variables.tf` (`cloudflare_zone_id`); `cloudflare-*.tf` and `aws-*.tf` read `var.cloudflare_zone_id` | Terraform | The `cloud8skate.com` zone is looked up by name through `data.cloudflare_zones` in `cloudflare-cloud8skate.tf`. |

## Docker Registry

| Value kind | Example value found | Files/locations (count + representative paths) | Consumed by | Notes |
| --- | --- | --- | --- | --- |
| Docker Hub image names | `iamharryliu/bucket-service`, `email-service`, `email-subscription-service`, `socket-server-socketio`, `office-presence-service`, `employee-handler-next`, `vb-code-server`, `llm-service`, `utilities-ui`, `waiting-games`, `vb-express` | 26 files: `deployment-configs/fly-configs/*.toml` (`image =`), `apps/api/*/project.json`, `apps/ui/{utilities-ui,waiting-games}/project.json`, `infrastructure/terraform/variables.tf` (`code_server_image`), `cloud-init-rabbitmq.yaml`, `docs/app-development/api/deployment/fly-service-pattern.md` | code, Terraform, workflow, docs | `vb-code-server` must stay public for the code-server VM pull (`docs/infrastructure/free-tier-infrastructure.md`). |
| Docker Hub namespace / user | `iamharryliu` | 5 files: `.github/workflows/deploy.yml` (`DOCKERHUB_USERNAME`), `manual-deploy-app.yml`, `deploy-code-server-image.yml`, `apps/ui/pages-index/src/app/consts/dockerImages.ts`, `scripts/node/repo-stats.mjs` | workflow, code | The pages-index Docker page and repo stats list images from this namespace. |

## Email Addresses

| Value kind | Example value found | Files/locations (count + representative paths) | Consumed by | Notes |
| --- | --- | --- | --- | --- |
| ACME / service admin email | `harryliu1995@gmail.com` | `infrastructure/terraform/variables.tf` (`acme_email`, `seafile_admin_email`) | Terraform | Used for certificates and the Seafile admin account. |
| Bitwarden / gcloud login email | `harryliu1995@gmail.com` | `infrastructure/terraform/scripts/load-vault-tf-env.sh` (`BW_LOGIN_EMAIL`), `projects/nx-workspace/scripts/shell/backup-secrets.sh`, `libs/@vigilant-broccoli/devops-cli/src/lib/gcloud/gcloud.consts.ts` (`GCLOUD_ACCOUNT`) | code (local scripts) | These are operator logins, not access grants. |
| Default notification recipient | `harryliu1995@gmail.com` | 5 files: `.github/scripts/{agentic-solve,deploy-complete,llm-out-of-credits}-email.mjs` (`EMAIL_TO` fallback), `.github/workflows/test-e2e-email-subscription-service.yml`, `test-smoke-email-service.yml` | workflow | Overridable through `EMAIL_TO`, but the fallback is hardcoded. |
| Git author identity | `harryliu1995@gmail.com` | `setup/dotfiles/.gitconfig` | code (dotfiles) | Installed onto machines by the setup scripts. |
| Owner contact email | `harryliu1995@gmail.com` | `libs/@harry/personal/src/email-address.const.ts`, `vb-manager-next/.../api-keys.component.tsx` (`DEFAULT_EMAIL`), `package.json` (`seafile:password`) | code | Contact details belong in `@harry/personal`. |
| Sender addresses on own domain | `ci-alerts@`, `ci-deploy@`, `ci-agentic-solve@`, `ci-test@`, `contact@`, `home.management@`, `test@harryliu.dev` | 7 files: `.github/scripts/*-email.mjs`, `.github/workflows/test-smoke-email-service.yml`, `apps/hearth/src/app/api/homes/[id]/members/route.ts`, `libs/@vigilant-broccoli/messaging/src/lib/email/email.service.ts`, `libs/@harry/personal/src/index.ts` | workflow, code | The email provider must have a verified sending domain. |
| SSH key comments / VM login | `harryliu@Harrys-MacBook-Pro.local`, VM user `harryliu` | `infrastructure/terraform/variables.tf` (`ssh_public_key`), `main.tf` (`ssh-keys` metadata), `infrastructure/local/README.md` (`/Users/harryliu`) | Terraform, docs | Public keys only. A fork replaces them with its own keys. |

## Fly.io

| Value kind | Example value found | Files/locations (count + representative paths) | Consumed by | Notes |
| --- | --- | --- | --- | --- |
| App names | `staging-`/`production-` + `vb-express`, `vb-email-service`, `email-subscription-service`, `llm-service`, `storage-service`; `demo-office-presence-service`, `vb-log-shipper` | 57 files outside `history/`: `deployment-configs/fly-configs/*.toml` (`app =`), `.github/workflows/{deploy,manual-kill-services,notify-complete}.yml`, `.github/actions/fly-private-tunnel/action.yml`, `docs/infrastructure/network-management.md` | code, workflow, docs | Fly app names are global. |
| Organization slug | `personal` | 5 files: `deployment-configs/fly-configs/log-shipper.toml` (`ORG`), `infrastructure/terraform/packer/scripts/rotate-fly-token.sh`, `projects/nx-workspace/scripts/deploy-flyio-secrets.ts`, `docs/infrastructure/*` | code, Terraform (VM scripts) | `personal` is Fly's default org slug, so it often carries over. |
| Public / private hostnames | `staging-vb-express.fly.dev`, `production-vb-express.fly.dev`, `staging-vb-email-service.flycast` | 23 files outside `history/`: `.upptimerc.yml`, `apps/hearth/project.json`, `apps/vb-manager-next-mobile/*`, `projects/nx-workspace/scripts/deploy-vercel.ts`, `infrastructure/upptime/warm-fly.sh` | code, workflow, monitoring, docs | These are derived from app names. |

## GCP

| Value kind | Example value found | Files/locations (count + representative paths) | Consumed by | Notes |
| --- | --- | --- | --- | --- |
| Compute VM / image family | `vb-free-vm`, `vb-vm` | 14 files: `infrastructure/config.sh`, `infrastructure/terraform/main.tf`, `packer/vb-vm.pkr.hcl`, `packer/Makefile`, `package.json` | Terraform, code | Names are project-scoped, so a fork can keep them. |
| GCS buckets | `vigilant-broccoli-backup`, `vb-storage-bucket` | 13 files: `infrastructure/terraform/main.tf`, `.github/workflows/cron-backup.yml`, `deployment-configs/fly-configs/*-bucket-service.toml`, `docs/repo-operations.md` | Terraform, workflow, code, docs | GCS bucket names are global, so a fork must rename them. |
| KMS keyring / key | `vault-keyring`, `vault-unseal-key` | `infrastructure/terraform/main.tf`, `packer/scripts/vault-config.hcl` | Terraform, VM config | These handle Vault auto-unseal. `vault-config.hcl` also hardcodes the project id. |
| OAuth client id (Google sign-in) | `88091895337-6a9s…apps.googleusercontent.com` | `infrastructure/terraform/supabase-auth.tf` (`external_google_client_id`) | Terraform | This is a public identifier; the secret comes from `TF_VAR_supabase_google_client_secret`. |
| Project id | `vigilant-broccoli` | 14 files: `infrastructure/config.sh` (`GCP_PROJECT`), `infrastructure/terraform/main.tf` (`provider "google"`, `projects/vigilant-broccoli/serviceAccounts/…`), `.github/workflows/ci-health-check.yml`, `libs/@vigilant-broccoli/devops-cli/src/lib/gcloud/gcloud.consts.ts`, `setup/dotfiles/zsh/aliases/vigilant-broccoli_aliases.sh`, `deployment-configs/fly-configs/*-bucket-service.toml` | Terraform, workflow, code | Most shell scripts read `GCP_PROJECT` from `infrastructure/config.sh`. |
| Project number | `88091895337` | 1 file: `infrastructure/terraform/supabase-auth.tf` (inside the Google OAuth client id) | Terraform | Terraform otherwise derives it from `data.google_project.project.number`; workflows get it through the WIF provider variables. |
| Secret Manager secret names | `VB_VM_VAULT_ROOT_TOKEN`, `VB_VM_VAULT_UNSEAL_KEYS`, `VB_VM_CLOUDFLARED_TUNNEL_TOKEN`, `VB_VM_WG_*`, `VAULT_CF_ACCESS_CLIENT_ID/SECRET`, `GOOGLE_GCS_SA_CREDENTIALS`, `GOOGLE_CALENDAR_SA_CREDENTIALS`, `BITWARDEN_PASSWORD` | 47 files: `infrastructure/terraform/main.tf` (`secret_id`), `infrastructure/terraform/packer/scripts/*.sh`, `.github/actions/vault-secrets/action.yml`, `.github/workflows/*.yml` (`vigilant-broccoli/VAULT_CF_ACCESS_*` in 7 files), `infrastructure/agent-sandbox/load-env-from-vault.sh` | Terraform, workflow, code | Names are project-scoped. Workflow references are prefixed with the project id. |
| Service accounts | `github-actions-pr-check@vigilant-broccoli.iam.gserviceaccount.com`, `github-actions-tf-drift@…`, `github-actions-deploy-preview@…`; ids `github-actions`, `github-actions-prod-promotion`, `github-actions-upptime-sync`, `gcs-manager`, `google-calendar-manager` | 7 `account_id` declarations in `infrastructure/terraform/main.tf`, `github-actions-*.tf` | Terraform | Workflows read the emails from the `GCP_SERVICE_ACCOUNT` repo secret or Terraform-managed repo variables (`*_SERVICE_ACCOUNT`), so a fork's apply fills them. |
| Workload identity pool / providers | `projects/88091895337/locations/global/workloadIdentityPools/github-actions/providers/github-pr-check` (also `github`, `github-tf-drift`, `github-deploy-preview`, `github-production-promotion`, `github-upptime-sync`) | Pool and providers in `infrastructure/terraform/main.tf`, `github-actions-*.tf` | Terraform | Workflows read the paths from the `GCP_WORKLOAD_IDENTITY_PROVIDER` repo secret or Terraform-managed repo variables (`*_WIF_PROVIDER`). Provider attribute conditions come from `var.github_owner`/`var.github_repo`. |

## GitHub

| Value kind | Example value found | Files/locations (count + representative paths) | Consumed by | Notes |
| --- | --- | --- | --- | --- |
| Checkout path assumption | `$HOME/vigilant-broccoli`, `/config/vigilant-broccoli` | 33 files: `infrastructure/agent-sandbox/*.sh` (15), `setup/dotfiles/**` (7), `setup/mac/install.sh`, `setup/linux/install.sh`, `.github/workflows/test-smoke-machine-setup.yml`, `infrastructure/terraform/cloud-init-code-server.yaml` | code, workflow, Terraform, docs | A fork renamed on clone breaks these paths. |
| GitHub App ids | `5202397` (Upptime sync), `5249426` (production promotion) | 3 files: `infrastructure/terraform/variables.tf`, `docs/infrastructure/{upptime,secret-rotation-implementation}.md` | Terraform, docs | Each fork must register its own apps. |
| GitHub Pages origin | `iamharryliu.github.io`, base path `/vigilant-broccoli/` | 4 files: `docs/infrastructure/network-management.md`, `docs/infrastructure/upptime.md`, `.claude/settings.json`, `.github/workflows/deploy-preview.yml` | Terraform (CNAME targets), docs | CNAMEs for `harryliu.dev` and `uptime.harryliu.dev` point here. |
| Gitea user / repo | `iamharryliu`, `iamharryliu/journal` | 2 files: `infrastructure/terraform/packer/scripts/rotate-gitea-token.sh`, `.github/workflows/test-smoke-api-keys.yml` | Terraform (VM scripts), workflow | This is the self-hosted Gitea account, not GitHub. |
| npm organization | `@vigilant-broccoli` scope, `npmjs.com/settings/vigilant-broccoli` | 749 files import the scope; 13 `package.json` files have `publishConfig`; links in `package.json`, `docs/infrastructure/infrastructure.md`, `libs/@vigilant-broccoli/public-links/src/lib/quick-links.consts.ts` | code, workflow (`publish-package`) | Imports can keep the scope, but publishing needs npm org ownership or a new scope. |
| Owner (user/org) | `iamharryliu` | 78 files: `infrastructure/config.sh` (`GITHUB_OWNER`), `infrastructure/terraform/variables.tf` (`github_owner`), `.upptimerc.yml` (`owner`, assignees), `apps/ui/pages-index/src/app/consts/{repo,githubRepos}.ts`, `libs/@harry/personal/src/index.ts` | Terraform, workflow, code, docs | Shell scripts and Terraform read the variables. UI consts and docs hardcode the owner. |
| Profile repository | `iamharryliu/iamharryliu` | 3 files: `.github/workflows/deploy-github-profile.yml` (`PROFILE_REPO`), `scripts/ci/rotate-profile-deploy-key.sh`, `docs/infrastructure/secret-management.md` | workflow, code, docs | Its name must equal the owner's username. The deploy key lives in the Vault/secret inventory. |
| Repository slug | `iamharryliu/vigilant-broccoli` | 33 files plus ~40 README badge URLs: `README.md`, `.github/actions/vault-secrets/action.yml`, `.github/workflows/cron-backup.yml`, `infrastructure/upptime/sync.py`, `libs/@vigilant-broccoli/*/package.json` (`repository`), `vb-manager-next/src/app/api/todo/solve/route.ts` | workflow, code, docs | `infrastructure/config.sh` and `variables.tf` define `GITHUB_REPO` / `github_repo`; TS code shares `VB_GITHUB_REPO` from `libs/@vigilant-broccoli/infrastructure`. |
| Upptime repository | `iamharryliu/uptime` | 9 files: `infrastructure/terraform/variables.tf` (`upptime_repo`), `github-upptime.tf`, `infrastructure/upptime/{sync.py,import-history.sh}`, `apps/ui/pages-index/README.md`, `docs/infrastructure/upptime.md` | Terraform, workflow, code, docs | This repo owns the generated `history/` and the status site. |

## Other Cloud and SaaS

| Value kind | Example value found | Files/locations (count + representative paths) | Consumed by | Notes |
| --- | --- | --- | --- | --- |
| AWS account / SSO profile | `841376026547`, profile `AdministratorAccess-841376026547` | 6 files: `package.json` (`aws:login`), `scripts/shell/cloud-login.sh`, `infrastructure/terraform/{variables,aws-terraform-user}.tf`, `docs/cheatsheet.md`, `docs/infrastructure/secret-management.md` | code, Terraform, docs | The region is `eu-north-1` (`aws_region`) and the AMI is region-specific (`ubuntu_ami`). |
| AWS IAM user | `terraform-testing` | `infrastructure/terraform/aws-terraform-user.tf`, `docs/infrastructure/secret-management.md` | Terraform | This is the long-lived key user for `pnpm tf:*`. |
| Bitwarden note | `vb-vault-secrets` | 4 files: `infrastructure/terraform/scripts/load-vault-tf-env.sh`, `projects/nx-workspace/scripts/shell/*`, `docs/infrastructure/secret-management.md`, `docs/app-development/ui/auth/supabase-auth-pattern.md` | code, docs | This is the local Terraform env source. |
| Google Analytics measurement ids | `G-GW4BER2BMZ`, `G-SJELMQXML9` | 4 files: `apps/ui/{cloud-8-skate-react,personal-website-react}/src/environments/environment*.ts` | code | Public ids. |
| OCI region / tenancy | `ca-toronto-1`; tenancy read from `~/.oci/config` | `infrastructure/terraform/main.tf` (`provider "oci"`), `infrastructure/lib/oci-local-config.sh`, `infrastructure/terraform/scripts/sync-oci-config-local.sh` | Terraform, code | No OCIDs are hardcoded. The tenancy is parsed at plan time. |
| Personal Google Calendar ids | `f61b08e9…@group.calendar.google.com`, `539abad7…@group.calendar.google.com` | `libs/@harry/private/src/private-calendar.const.ts` | code | Public holiday/moon calendars in `common-browser` are not personal. |
| Sanity project id | `akt6kw0u` | 6 files: `apps/cms/cloud8skate-sanity/sanity.{cli,config}.ts`, `apps/ui/cloud-8-skate-react/src/app/core/services/sanity.service.ts`, `scripts/generate-sitemap.mjs`, `.github/workflows/test-smoke-api-keys.yml` | code, workflow | This belongs to the `cloud8skate.com` CMS. |
| Supabase project ref | `jrdosjjgmsoodpjmjqxx` (`jrdosjjgmsoodpjmjqxx.supabase.co`) | 9 files: `infrastructure/terraform/supabase-auth.tf`, `libs/@vigilant-broccoli/infrastructure/src/lib/supabase-public.json`, `apps/ui/employee-handler-ui/project.json`, `deployment-configs/fly-configs/*-vb-express.toml`, `projects/nx-workspace/scripts/migrate.ts`, `.github/workflows/cron-backup.yml` | Terraform, code, workflow | `supabase-public.json` also holds the public publishable key, which is omitted here. |
| Tailscale tailnet | `echidna-rohu.ts.net` (`jellyfin-pi.echidna-rohu.ts.net`) | 6 files: `infrastructure/jellyfin-pi/group_vars/jellyfin_pi.yml`, `infrastructure/jellyfin-pi/README.md`, `vb-manager-next/src/app/api/tailscale/machines/route.ts`, `docs/infrastructure/{jellyfin-pi,network-management}.md`, `README.md` | code (Ansible), docs | The tailnet name is account-specific. |

## Public Hostnames and Domains

| Value kind | Example value found | Files/locations (count + representative paths) | Consumed by | Notes |
| --- | --- | --- | --- | --- |
| Apex personal domain | `harryliu.dev`, `www.harryliu.dev` | 118 files outside `history/`: `infrastructure/terraform/cloudflare-harryliu-dev.tf`, `variables.tf`, `.upptimerc.yml`, `apps/ui/*` (35), `libs/@vigilant-broccoli/*` (10), `.github/workflows/*` (15), `docs/infrastructure/network-management.md` | Terraform, code, workflow, monitoring, docs | This is the main zone; every subdomain row below depends on it. |
| Local dev domain | `*.vigilant-broccoli.app` (`manager.`, `grafana.`, `loki.`, `images.`, `sync.`) | 18 files: `infrastructure/local/{hosts,setup-certs.sh}`, `infrastructure/local/k3s/manifests/**`, `libs/@vigilant-broccoli/private-infrastructure/src/lib/local-host.consts.ts`, `vb-manager-next/ecosystem.config.js`, `infrastructure/terraform/supabase-auth.tf`, `setup/mac/install.sh` | code, Terraform, docs | Resolved through `/etc/hosts` only. It's in the Supabase redirect allowlist and Spotify callback. |
| Monitoring history snapshots | `history/*.yml` (62 files) | `history/` | monitoring (generated) | Upptime-generated per-URL history. It's regenerated in the Upptime repo, so a fork doesn't edit it. |
| Pages `*.pages.dev` hostnames | `production-docs-md.pages.dev`, `staging-harryliu-dev-react.pages.dev` | 20 files outside `history/`: `infrastructure/terraform/variables.tf`, `cloudflare-staging-ui.tf`, `.upptimerc.yml`, `libs/@vigilant-broccoli/infrastructure/src/lib/app.consts.ts` | Terraform, code, monitoring | These are derived from the [Cloudflare](#cloudflare) Pages project names. |
| Second-level site domain | `cloud8skate.com` | 21 files outside `history/`: `infrastructure/terraform/cloudflare-cloud8skate.tf`, `variables.tf`, `apps/ui/cloud-8-skate-react/*`, `apps/cms/*`, `.upptimerc.yml` | Terraform, code, monitoring, docs | This is a separate Cloudflare zone, looked up by name. |
| Subdomains (self-hosted) | `vault.`, `git.`, `ssh.git.`, `code.`, `drive.`, `images.`, `grafana.`, `loki.`, `queue.`, `nx-cache.`, `socket.`, `api.harryliu.dev` | `infrastructure/terraform/variables.tf` (`*_domain`), `cloudflare-*.tf`, `aws-*.tf`, `oci-*.tf`, `.github/workflows/*` (`VAULT_ADDR`, Gitea API), `deployment-configs/fly-configs/*`, `apps/ui/*/src/**` | Terraform, workflow, code, monitoring | Terraform reads them from variables. Workflows and app code repeat them as literals. |
| Subdomains (static/Pages/Vercel) | `docs.`, `context.`, `components.`, `bookmarks.`, `pomodoro.`, `links.`, `utilities.`, `waiting.`, `calendar.`, `projects.`, `career.`, `deployments.`, `status.`, `uptime.`, `weather.`, `findme.`, `whiteboard.`, `balloono.`, `manager.`, `hearth.harryliu.dev` | `infrastructure/terraform/variables.tf`, `cloudflare-vercel-apps.tf`, `.upptimerc.yml`, `apps/ui/pages-index/src/app/consts/{hosts,webApplications}.*`, `libs/@vigilant-broccoli/public-links/src/lib/quick-links.consts.ts`, `apps/api/vb-express/src/main.ts` (`ALLOWED_ORIGINS`) | Terraform, code, monitoring, docs | Public URL changes require synchronized Upptime, pages-index and quick-link entries ([app-development.md](./app-development/app-development.md#deployment)). |

## Terraform Cloud

| Value kind | Example value found | Files/locations (count + representative paths) | Consumed by | Notes |
| --- | --- | --- | --- | --- |
| Organization | `vigilant-broccoli` | 5 files: `infrastructure/terraform/main.tf` (`cloud { organization }`), `package.json`, `vb-manager-next/src/app/api/terraform/status/route.ts`, `libs/@vigilant-broccoli/private-infrastructure/src/lib/account.consts.ts`, `docs/infrastructure/free-tier-infrastructure.md` | Terraform, code, docs | Organization names are global. |
| Workspace | `vigilant-broccoli-infrastructure` | The same files except `account.consts.ts` (4) | Terraform, code | `tf:unlock` in `package.json` references `vigilant-broccoli/vigilant-broccoli-infrastructure`. |

## Vault

| Value kind | Example value found | Files/locations (count + representative paths) | Consumed by | Notes |
| --- | --- | --- | --- | --- |
| JWT roles / policies | `github-actions-role`, `github-actions-pr-check-role`, `github-actions-deploy-preview-role`, `github-actions-production-promotion-role`, … | `infrastructure/config.sh` (`VAULT_*_ROLE_NAME`, `VAULT_*_POLICY_NAME`), `infrastructure/terraform/scripts/post-apply.sh`, `.github/workflows/*.yml` | Terraform (post-apply), workflow | Bound claims use `GITHUB_OWNER`/`GITHUB_REPO` from `config.sh`. |
| KV paths | `kv/data/secrets`, `kv/data/deploy-preview`, `kv/data/ci-pr-check`, `kv/production-promotion`, `kv/upptime-sync` | 60 files: `.github/workflows/*.yml` (43), `.github/actions/vault-secrets/action.yml`, `projects/nx-workspace/scripts/vault-client.ts`, `infrastructure/agent-sandbox/*` | workflow, code | These are structural, not account-bound, so a fork can keep them. |
| Private / loopback address | `https://10.0.1.1:8200` (WireGuard), `https://127.0.0.1:8200` | 29 files: `infrastructure/terraform/packer/scripts/*.sh`, `infrastructure/terraform/cloud-init-*.yaml`, `projects/nx-workspace/scripts/vault-client.ts` | Terraform (VM scripts), code | These are network layout, not identity. |
| Public address | `https://vault.harryliu.dev` | 17 files: `.github/workflows/*.yml` (`VAULT_ADDR`, 6), `.github/actions/vault-secrets/action.yml`, `infrastructure/terraform/scripts/load-vault-tf-env.sh`, `infrastructure/terraform/{variables,cloudflare-vault}.tf`, `projects/nx-workspace/scripts/vault-client.ts`, `docs/infrastructure/*`, `README.md` | workflow, Terraform, code, docs | It's behind Cloudflare Access (`vault` application plus the `vault-ci` service token). |

## Vercel

| Value kind | Example value found | Files/locations (count + representative paths) | Consumed by | Notes |
| --- | --- | --- | --- | --- |
| Deployment hostnames | `production-hearth.vercel.app`, `staging-findme.vercel.app`, `demo-employee-handler-ui.vercel.app` | 14 files outside `history/`: `.upptimerc.yml`, `infrastructure/terraform/{cloudflare-vercel-apps,supabase-auth}.tf`, `projects/nx-workspace/scripts/deploy-vercel.ts`, `libs/@vigilant-broccoli/infrastructure/src/lib/app.consts.ts`, `docs/app-development/*` | Terraform, code, monitoring, docs | `*.vercel.app` names are global and derived from the project names. |
| Project names | `<env>-<app>`: `staging-`/`production-` + `hearth`, `findme`, `whiteboard`, `weather-next`, `balloono`, `vb-manager-next-mobile`; `demo-employee-handler-ui` | 10 files: `apps/{findme,hearth,whiteboard,vb-manager-next-mobile}/project.json`, `apps/ui/{balloono,weather-next,employee-handler-ui}/project.json` (`VERCEL_PROJECT_ID`), `projects/nx-workspace/scripts/deploy-vercel.ts` | code (Nx targets) | Vercel projects are created on first deploy. |
| Team id | `team_K8XGLgKfYA0WKlMX80jaVSvg` | 7 files: 5 app `project.json` files (`VERCEL_ORG_ID`), `projects/nx-workspace/scripts/{vercel-domains,prune-orphaned-services}.ts` | code, workflow | The deploy token comes from Vault. |

## Literal Values and Personal Content

| Value kind | Example value found | Files/locations (count + representative paths) | Consumed by | Notes |
| --- | --- | --- | --- | --- |
| API-key seed identity (keep literal) | `SEED_ACCOUNT_EMAIL = 'harryliu1995@gmail.com'` | `projects/nx-workspace/apps/api/vb-express/src/libs/api-key-seed.ts` | code | Per `AGENTS.md`, keep this literal so a contact change can't change access. A fork edits the literal and doesn't wire it to shared config. |
| Cloudflare Access allowlists (keep literal) | `harryliu1995@gmail.com` in `*_allowed_emails` | `infrastructure/terraform/variables.tf` (`gitea_`, `code_server_`, `seafile_`, `immich_`, `grafana_`, `rabbitmq_allowed_emails`), `cloudflare-staging-ui.tf` | Terraform | These are auth allowlists. Keep them literal per `AGENTS.md`. |
| Mobile app allowlist (keep literal) | `ALLOWED_EMAIL = 'harryliu1995@gmail.com'` | `projects/nx-workspace/apps/vb-manager-next-mobile/libs/auth-policy.ts` | code | This is an auth allowlist. Keep it literal per `AGENTS.md`. |
| Notes and career narrative (personal) | `notes/` (incl. `notes/personal/personal-software-career-experience.md`) | `notes/**` (523 files) | docs | This is personal content, not config. A fork deletes or replaces it. |
| Personal assets (personal) | Email signatures, wallpapers, about page, link tree | `personal/email-signatures/*`, `personal/wallpapers/*`, `snippets/email-template/template.html`, `apps/ui/personal-website-react/src/app/content/about.md`, `apps/ui/personal-website-react/public/assets/email-signature/index.html` | code, docs | This is personal content, not config. |
| Resume (personal) | `resume.json` contact block and experience | `projects/nx-workspace/libs/@vigilant-broccoli/resume/src/resume.json` | code | Personal content, not config. It feeds the career pages and resume chat. |
| Resume career chat prompt (personal) | Resume chat system prompt and skills note | `apps/ui/vb-manager-next/src/app/api/resume/chat/{resume-chat.prompt.ts,resume-chat.skills-note.server.ts}`, `apps/ui/vb-manager-next/src/lib/resume-chat.fidelity.ts` | code | This is personal content, not config. |
| Supabase RLS owner checks (keep literal) | `lower(auth.email()) = 'harryliu1995@gmail.com'` | `apps/ui/vb-manager-next/supabase/migrations/20260818000000_restrict_notepad_and_event_calendars_read_access.sql`, `20260908000000_authorize_notepad_realtime_channel.sql` | database migrations | `migrate.ts` tracks migrations by filename in `schema_migrations`, so on an existing database a fork adds a new migration instead of editing these. |
