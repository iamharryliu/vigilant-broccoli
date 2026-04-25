variable "region" {
  type    = string
  default = "us-east1"
}

variable "zone" {
  type    = string
  default = "us-east1-b"
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
  default = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIISE8yIDUuc3MRphJDr212uIjQEqU+JFgwQCSL6VvHRw harryliu@Harrys-MacBook-Pro.local"
}

variable "rabbitmq_user" {
  type    = string
  default = "admin"
}

variable "email_consumer_image" {
  type    = string
  default = "iamharryliu/email-consumer:latest"
}

variable "email_service_url" {
  type    = string
  default = "https://vb-email-service.fly.dev"
}

variable "email_service_api_key" {
  type      = string
  sensitive = true
}
