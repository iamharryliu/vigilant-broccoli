# git.harryliu.dev — Gitea on the OCI VM, proxied through Cloudflare and gated
# by Zero Trust Access. Two policies: owner email (browser web UI) and a
# non-identity service token so git-over-HTTPS and CI (cron-deploy-journal's
# /api/v1 archive pull) keep working. Git-over-SSH on :2222 bypasses Access and
# stays direct — humans use SSH, CI uses the HTTPS service token.
#
# The origin can't use ACME behind the proxy (HTTP-01 can't complete), so Caddy
# serves a long-lived Cloudflare Origin CA cert instead — same pattern as
# oci-code-server.tf. The proxied A record and OCI 80/443 ingress lockdown to
# Cloudflare ranges live in oci-gitea.tf.

resource "tls_private_key" "gitea_origin" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "tls_cert_request" "gitea_origin" {
  private_key_pem = tls_private_key.gitea_origin.private_key_pem

  subject {
    common_name = var.gitea_domain
  }
}

# 15-year Cloudflare Origin CA cert — replaces ACME, which can't complete behind Access
resource "cloudflare_origin_ca_certificate" "gitea" {
  csr                = tls_cert_request.gitea_origin.cert_request_pem
  hostnames          = [var.gitea_domain]
  request_type       = "origin-rsa"
  requested_validity = 5475
}

resource "cloudflare_zero_trust_access_service_token" "gitea_ci" {
  account_id = var.cloudflare_account_id
  name       = "gitea-ci"
}

resource "cloudflare_zero_trust_access_policy" "gitea_owner" {
  account_id = var.cloudflare_account_id
  name       = "gitea-allow-owner"
  decision   = "allow"
  include    = [for email in var.gitea_allowed_emails : { email = { email = email } }]
}

resource "cloudflare_zero_trust_access_policy" "gitea_ci" {
  account_id = var.cloudflare_account_id
  name       = "gitea-allow-ci-service-token"
  decision   = "non_identity"
  include = [{
    service_token = { token_id = cloudflare_zero_trust_access_service_token.gitea_ci.id }
  }]
}

resource "cloudflare_zero_trust_access_application" "gitea" {
  account_id       = var.cloudflare_account_id
  name             = "gitea"
  domain           = var.gitea_domain
  type             = "self_hosted"
  session_duration = "24h"

  policies = [
    {
      id         = cloudflare_zero_trust_access_policy.gitea_owner.id
      precedence = 1
    },
    {
      id         = cloudflare_zero_trust_access_policy.gitea_ci.id
      precedence = 2
    },
  ]
}
