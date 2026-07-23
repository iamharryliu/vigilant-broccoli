variable "region" {
  type    = string
  default = "us-central1"
}

variable "zone" {
  type    = string
  default = "us-central1-a"
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

variable "nx_cache_r2_bucket" {
  description = "R2 bucket backing the Nx self-hosted remote cache (see cloudflare-nx-cache.tf)."
  type        = string
  default     = "nx-cache"
}

# 7 days. Cache entries are cheap to regenerate (a miss just rebuilds), so a
# short TTL keeps the bucket comfortably inside R2's 10 GB free tier.
variable "nx_cache_r2_ttl_seconds" {
  description = "Age in seconds after which Nx remote-cache objects are deleted by the R2 lifecycle rule."
  type        = number
  default     = 604800
}

variable "code_server_domain" {
  type    = string
  default = "code.harryliu.dev"
}

variable "code_server_allowed_emails" {
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

variable "journal_domain" {
  type    = string
  default = "journal.harryliu.dev"
}

variable "journal_pages_project" {
  type    = string
  default = "staging-journal"
}

# Kept separate from the project name: Cloudflare appends a suffix when
# <project>.pages.dev is taken globally (the old `journal` project got journal-d64).
variable "journal_pages_subdomain" {
  type    = string
  default = "staging-journal.pages.dev"
}

variable "journal_allowed_emails" {
  type    = list(string)
  default = ["harryliu1995@gmail.com"]
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
