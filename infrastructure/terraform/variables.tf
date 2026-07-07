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
  default = "journal"
}

# Cloudflare appended a suffix because journal.pages.dev was taken globally.
variable "journal_pages_subdomain" {
  type    = string
  default = "journal-d64.pages.dev"
}

variable "journal_allowed_emails" {
  type    = list(string)
  default = ["harryliu1995@gmail.com"]
}
