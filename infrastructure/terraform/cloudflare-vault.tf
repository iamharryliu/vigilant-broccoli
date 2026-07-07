# CI access to Vault on vb-free-vm: cloudflared tunnel (outbound from the VM,
# so the ephemeral external IP never matters) exposed at vault.harryliu.dev,
# gated by a Cloudflare Access service token. Concurrent workflows are fine —
# plain HTTPS, no per-connection state (unlike IAP tunnels or a shared
# WireGuard peer). Authorization stays with Vault's GitHub OIDC JWT roles.

resource "cloudflare_zero_trust_tunnel_cloudflared" "vault" {
  account_id = var.cloudflare_account_id
  name       = "vault"
  config_src = "cloudflare"
}

data "cloudflare_zero_trust_tunnel_cloudflared_token" "vault" {
  account_id = var.cloudflare_account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.vault.id
}

# Origin serves the self-signed Vault cert; the hop is localhost-only.
resource "cloudflare_zero_trust_tunnel_cloudflared_config" "vault" {
  account_id = var.cloudflare_account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.vault.id

  config = {
    ingress = [
      {
        hostname = var.vault_domain
        service  = "https://localhost:8200"
        origin_request = {
          no_tls_verify = true
        }
      },
      {
        service = "http_status:404"
      }
    ]
  }
}

resource "cloudflare_dns_record" "vault" {
  zone_id = var.cloudflare_zone_id
  name    = var.vault_domain
  content = "${cloudflare_zero_trust_tunnel_cloudflared.vault.id}.cfargotunnel.com"
  type    = "CNAME"
  ttl     = 1
  proxied = true
}

resource "cloudflare_zero_trust_access_service_token" "vault_ci" {
  account_id = var.cloudflare_account_id
  name       = "vault-ci"
}

resource "cloudflare_zero_trust_access_policy" "vault_ci" {
  account_id = var.cloudflare_account_id
  name       = "vault-allow-ci-service-token"
  decision   = "non_identity"
  include = [{
    service_token = { token_id = cloudflare_zero_trust_access_service_token.vault_ci.id }
  }]
}

resource "cloudflare_zero_trust_access_application" "vault" {
  account_id       = var.cloudflare_account_id
  name             = "vault"
  domain           = var.vault_domain
  type             = "self_hosted"
  session_duration = "24h"

  policies = [{
    id         = cloudflare_zero_trust_access_policy.vault_ci.id
    precedence = 1
  }]
}

# VM first boot pulls the tunnel token from here (cloudflared-init.sh).
resource "google_secret_manager_secret" "cloudflared_tunnel_token" {
  secret_id = "VB_VM_CLOUDFLARED_TUNNEL_TOKEN"

  replication {
    auto {}
  }

  depends_on = [google_project_service.secretmanager]
}

resource "google_secret_manager_secret_version" "cloudflared_tunnel_token" {
  secret      = google_secret_manager_secret.cloudflared_tunnel_token.id
  secret_data = data.cloudflare_zero_trust_tunnel_cloudflared_token.vault.token
}

resource "github_actions_secret" "vault_cf_access_client_id" {
  repository  = github_repository.vigilant_broccoli.name
  secret_name = "VAULT_CF_ACCESS_CLIENT_ID"
  value       = cloudflare_zero_trust_access_service_token.vault_ci.client_id
}

resource "github_actions_secret" "vault_cf_access_client_secret" {
  repository  = github_repository.vigilant_broccoli.name
  secret_name = "VAULT_CF_ACCESS_CLIENT_SECRET"
  value       = cloudflare_zero_trust_access_service_token.vault_ci.client_secret
}
