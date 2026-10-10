variable "region" {
  type    = string
  default = "us-central1"
}

variable "zone" {
  type    = string
  default = "us-central1-a"
}

variable "aws_region" {
  type    = string
  default = "eu-north-1"
}

# Left null so the provider falls through to the standard credential chain and
# picks up the AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY that load-vault-tf-env.sh
# exports for the `terraform-testing` IAM user -- no `aws sso login` before
# `tf:apply`. That user is created and permissioned by hand in the IAM console,
# not managed here, same as the Cloudflare/GitHub/Supabase provider credentials.
# Set TF_VAR_aws_profile=AdministratorAccess-841376026547 to fall back to SSO
# (e.g. to re-mint those keys after they're revoked).
variable "aws_profile" {
  type    = string
  default = null
}

# Boot image for the Seafile and Immich VMs. Pinned rather than resolved via a
# `most_recent = true` aws_ami data source: that made every Canonical Jammy
# release turn a routine `tf:plan` into a two-service rebuild, and it made
# `pnpm seafile:replace` / `immich:replace` jump to an unreviewed image at the
# exact moment you're replacing a VM to debug something else. Same reasoning as
# code_server_image below. Both VMs keep their data on separate EBS volumes, so
# bumping this is a deliberate rebuild, not a data migration.
#
# Find the current Canonical build:
#   aws ec2 describe-images --owners 099720109477 --region eu-north-1 \
#     --filters 'Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*' \
#               'Name=virtualization-type,Values=hvm' \
#     --query 'sort_by(Images, &CreationDate)[-1].[ImageId,Name]' --output text
variable "ubuntu_ami" {
  type    = string
  default = "ami-0a852fb2d1e35922f"
}

variable "github_owner" {
  description = "GitHub repository owner"
  type        = string
  default     = "iamharryliu"
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
  default     = "vigilant-broccoli"
}

variable "upptime_repo" {
  description = "Public repository managed by this workspace for isolated Upptime monitoring."
  type        = string
  default     = "uptime"

  validation {
    condition     = can(regex("^[A-Za-z0-9_.-]+$", var.upptime_repo)) && lower(var.upptime_repo) != lower(var.github_repo)
    error_message = "Use a separate GitHub repository name."
  }
}

variable "upptime_sync_gh_app_id" {
  description = "Public ID of the sync App installed only on the monitoring repository (Contents + Workflows RW). Set after registering the App and storing its key in kv/upptime-sync. Zero keeps sync disabled."
  type        = number
  default     = 5202397
}

variable "production_promotion_gh_app_id" {
  description = "Public ID of the dedicated production-promotion App installed only on this repository (Contents write). Set after registering the App and storing its key in kv/production-promotion. Zero leaves the production update ruleset disabled and the promotion workflow gated off."
  type        = number
  default     = 5249426
}

variable "upptime_migration_complete" {
  description = "Enables scheduled checks in the initialized monitoring repository. Set true only after importing history and verifying manual checks."
  type        = bool
  default     = true

  validation {
    condition     = !var.upptime_migration_complete || var.upptime_sync_gh_app_id > 0
    error_message = "Configure the monitoring sync App before completing migration."
  }
}

variable "cloudflare_account_id" {
  type    = string
  default = "26d066ec62c4d27b8da5e9aebac17293"
}

variable "ssh_public_key" {
  type    = string
  default = <<-EOT
    ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIISE8yIDUuc3MRphJDr212uIjQEqU+JFgwQCSL6VvHRw harryliu@Harrys-MacBook-Pro.local
    ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFmxmrbaLFOPcNsAVJwUwIMGuVosZQytQtZiKO/tK9OX harryliu1995@gmail.com
  EOT
}

variable "rabbitmq_user" {
  type    = string
  default = "admin"
}

variable "gitea_domain" {
  type    = string
  default = "git.harryliu.dev"
}

# DNS-only (grey-cloud) hostname for git-over-SSH on :2222. The apex git.harryliu.dev
# is Cloudflare-proxied for the Access-gated web UI, and the proxy doesn't forward
# :2222 — so SSH needs a direct-to-VM hostname.
variable "gitea_ssh_domain" {
  type    = string
  default = "ssh.git.harryliu.dev"
}

variable "gitea_allowed_emails" {
  type    = list(string)
  default = ["harryliu1995@gmail.com"]
}

variable "acme_email" {
  type    = string
  default = "harryliu1995@gmail.com"
}

variable "cloudflare_zone_id" {
  type    = string
  default = "6cb0ddc52a5da0094c589bdf7adc16ad"
}

variable "code_server_domain" {
  type    = string
  default = "code.harryliu.dev"
}

# Built and pushed by .github/workflows/deploy-code-server-image.yml, which
# also publishes an immutable sha-<commit> tag -- set this to one of those to
# pin the VM to a known build or roll back.
variable "code_server_image" {
  type    = string
  default = "iamharryliu/vb-code-server:latest"
}

variable "code_server_allowed_emails" {
  type    = list(string)
  default = ["harryliu1995@gmail.com"]
}

# The same `claude setup-token` OAuth token the agent sandbox uses, so Claude
# Code in the code-server terminal needs no interactive login. Set via
# TF_VAR_claude_code_oauth_token from Vault's CLAUDE_CODE_OAUTH_TOKEN.
variable "claude_code_oauth_token" {
  type      = string
  sensitive = true
  default   = ""
}

variable "seafile_domain" {
  type    = string
  default = "drive.harryliu.dev"
}

variable "seafile_allowed_emails" {
  type    = list(string)
  default = ["harryliu1995@gmail.com"]
}

variable "seafile_admin_email" {
  type    = string
  default = "harryliu1995@gmail.com"
}

variable "immich_domain" {
  type    = string
  default = "images.harryliu.dev"
}

variable "immich_allowed_emails" {
  type    = list(string)
  default = ["harryliu1995@gmail.com"]
}

variable "grafana_domain" {
  type    = string
  default = "grafana.harryliu.dev"
}

# Loki push endpoint for machine clients (Fly log shipper); same tunnel and VM
# as Grafana, gated by nginx basic auth instead of Cloudflare Access.
variable "loki_domain" {
  type    = string
  default = "loki.harryliu.dev"
}

variable "loki_push_user" {
  type    = string
  default = "fly-log-shipper"
}

variable "grafana_allowed_emails" {
  type    = list(string)
  default = ["harryliu1995@gmail.com"]
}

# t3.small (2 GB) is the floor for Grafana + Loki + Alloy + cloudflared; a
# t3.micro fits the 12-month free tier but swaps under Loki compaction.
variable "grafana_instance_type" {
  type    = string
  default = "t3.small"
}

variable "vault_domain" {
  type    = string
  default = "vault.harryliu.dev"
}

variable "socket_server_domain" {
  type    = string
  default = "socket.harryliu.dev"
}

variable "nx_cache_domain" {
  type    = string
  default = "nx-cache.harryliu.dev"
}

# 7 days: a cache miss just rebuilds, so a short TTL trades a little compute
# for bounded R2 storage (keeps usage inside the 10 GB free tier).
variable "nx_cache_r2_ttl_seconds" {
  type    = number
  default = 604800
}

variable "docs_domain" {
  type    = string
  default = "docs.harryliu.dev"
}

variable "docs_pages_project" {
  type    = string
  default = "production-docs-md"
}

# Kept separate from the project name: Cloudflare appends a suffix when
# <project>.pages.dev is taken globally.
variable "docs_pages_subdomain" {
  type    = string
  default = "production-docs-md.pages.dev"
}

variable "context_domain" {
  type    = string
  default = "context.harryliu.dev"
}

variable "context_pages_project" {
  type    = string
  default = "production-context-md"
}

variable "context_pages_subdomain" {
  type    = string
  default = "production-context-md.pages.dev"
}

variable "utilities_domain" {
  type    = string
  default = "utilities.harryliu.dev"
}

variable "utilities_pages_project" {
  type    = string
  default = "production-utilities-ui"
}

variable "utilities_pages_subdomain" {
  type    = string
  default = "production-utilities-ui.pages.dev"
}

variable "waiting_domain" {
  type    = string
  default = "waiting.harryliu.dev"
}

variable "waiting_pages_project" {
  type    = string
  default = "production-waiting-games"
}

variable "waiting_pages_subdomain" {
  type    = string
  default = "production-waiting-games.pages.dev"
}

variable "calendars_domain" {
  type    = string
  default = "calendar.harryliu.dev"
}

variable "calendars_pages_project" {
  type    = string
  default = "production-calendars"
}

variable "calendars_pages_subdomain" {
  type    = string
  default = "production-calendars.pages.dev"
}

variable "projects_domain" {
  type    = string
  default = "projects.harryliu.dev"
}

variable "status_domain" {
  type    = string
  default = "status.harryliu.dev"
}

variable "uptime_domain" {
  type    = string
  default = "uptime.harryliu.dev"
}

variable "upptime_https_enforced" {
  type        = bool
  default     = false
  description = "Enforce HTTPS on the Upptime Pages site. Set true only after GitHub has issued a certificate covering the custom domain; the API rejects it earlier."
}

variable "component_library_domain" {
  type    = string
  default = "components.harryliu.dev"
}

variable "component_library_pages_project" {
  type    = string
  default = "production-component-library"
}

variable "component_library_pages_subdomain" {
  type    = string
  default = "production-component-library.pages.dev"
}

variable "links_domain" {
  type    = string
  default = "links.harryliu.dev"
}

variable "links_pages_project" {
  type    = string
  default = "production-links-react"
}

variable "links_pages_subdomain" {
  type    = string
  default = "production-links-react.pages.dev"
}

variable "cloud8skate_domain" {
  type    = string
  default = "cloud8skate.com"
}

variable "cloud8skate_pages_project" {
  type    = string
  default = "production-cloud-8-skate-react"
}

variable "cloud8skate_pages_subdomain" {
  type    = string
  default = "production-cloud-8-skate-react.pages.dev"
}

variable "harryliu_dev_pages_project" {
  type    = string
  default = "production-harryliu-dev-react"
}

variable "harryliu_dev_pages_subdomain" {
  type    = string
  default = "production-harryliu-dev-react.pages.dev"
}
