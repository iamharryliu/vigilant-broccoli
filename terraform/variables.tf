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
  type = string
}

variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}

variable "tenancy_ocid" {
  type = string
}

variable "user_ocid" {
  type = string
}

variable "fingerprint" {
  type = string
}

variable "private_key_path" {
  type    = string
  default = "/Users/harryliu/.ssh/oci_api_key.pem"
}

variable "ssh_public_key" {
  type    = string
  default = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIISE8yIDUuc3MRphJDr212uIjQEqU+JFgwQCSL6VvHRw harryliu@Harrys-MacBook-Pro.local"
}

variable "rabbitmq_user" {
  type    = string
  default = "admin"
}

variable "rabbitmq_password" {
  type      = string
  default   = "changeme"
  sensitive = true
}
