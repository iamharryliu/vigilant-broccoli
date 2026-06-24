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

variable "gitea_acme_email" {
  type    = string
  default = "harryliu1995@gmail.com"
}

variable "cloudflare_zone_id" {
  type    = string
  default = "6cb0ddc52a5da0094c589bdf7adc16ad"
}
