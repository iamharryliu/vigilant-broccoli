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
