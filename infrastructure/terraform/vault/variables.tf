variable "cf_access_client_id" {
  description = "Cloudflare Access service token client ID for vault.vigilant-broccoli.app"
  type        = string
  sensitive   = true
}

variable "cf_access_client_secret" {
  description = "Cloudflare Access service token client secret for vault.vigilant-broccoli.app"
  type        = string
  sensitive   = true
}

variable "github_repository" {
  description = "owner/repo whose GitHub Actions OIDC tokens the JWT roles accept"
  type        = string
  default     = "iamharryliu/vigilant-broccoli"
}

variable "kv_path" {
  description = "Mount path of the KV v2 secrets engine"
  type        = string
  default     = "kv"
}

variable "jwt_backend" {
  description = "Mount path of the JWT auth method configured by run-vault-post-init.sh"
  type        = string
  default     = "jwt"
}
