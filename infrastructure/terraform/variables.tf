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

variable "upptime_gh_app_id" {
  description = "App ID of the dedicated GitHub App (Contents + Issues RW only) that the upptime crons use to push status commits and manage incident issues. Not a secret — it's visible in the ruleset config — so it's hardcoded here like the other non-secret IDs. Only its private key (UPPTIME_GH_APP_PRIVATE_KEY) lives in Vault. If the app is recreated, update this and the ID in the two cron-upptime workflows."
  type        = number
  default     = 4350545
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
  default = "staging-docs-md"
}

# Kept separate from the project name: Cloudflare appends a suffix when
# <project>.pages.dev is taken globally.
variable "docs_pages_subdomain" {
  type    = string
  default = "staging-docs-md.pages.dev"
}

variable "cloud8skate_domain" {
  type    = string
  default = "cloud8skate.com"
}

variable "cloud8skate_pages_project" {
  type    = string
  default = "staging-cloud-8-skate-angular"
}

variable "cloud8skate_pages_subdomain" {
  type    = string
  default = "staging-cloud-8-skate-angular.pages.dev"
}

variable "harryliu_dev_pages_project" {
  type    = string
  default = "staging-harryliu-dev-react"
}

variable "harryliu_dev_pages_subdomain" {
  type    = string
  default = "staging-harryliu-dev-react.pages.dev"
}
