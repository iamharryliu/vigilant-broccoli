# sandbox.harryliu.dev — Cloudflare Pages test harness for Google sign-in through
# VB Express Better Auth (project + deploys owned by the sandbox app's
# deploy:production target via wrangler). Production only. Owner-only Access
# covers the custom host and the project's pages.dev root, branch and
# immutable deployment aliases.

resource "cloudflare_zero_trust_access_policy" "sandbox_owner" {
  account_id = var.cloudflare_account_id
  name       = "sandbox-allow-owner"
  decision   = "allow"
  include    = [for email in var.sandbox_allowed_emails : { email = { email = email } }]
}

resource "cloudflare_zero_trust_access_application" "sandbox" {
  account_id       = var.cloudflare_account_id
  name             = "sandbox"
  domain           = var.sandbox_domain
  type             = "self_hosted"
  session_duration = "24h"
  destinations = [
    { type = "public", uri = var.sandbox_domain },
    { type = "public", uri = var.sandbox_pages_subdomain },
    { type = "public", uri = "*.${var.sandbox_pages_subdomain}" },
  ]
  policies = [
    { id = cloudflare_zero_trust_access_policy.sandbox_owner.id, precedence = 1 },
  ]
}

# Protect the new hostname before attaching or routing traffic to it.
resource "cloudflare_pages_domain" "sandbox" {
  account_id   = var.cloudflare_account_id
  project_name = var.sandbox_pages_project
  name         = var.sandbox_domain
  depends_on   = [cloudflare_zero_trust_access_application.sandbox]
}

resource "cloudflare_dns_record" "sandbox" {
  zone_id    = var.cloudflare_zone_id
  name       = var.sandbox_domain
  content    = var.sandbox_pages_subdomain
  type       = "CNAME"
  ttl        = 1
  proxied    = true
  depends_on = [cloudflare_zero_trust_access_application.sandbox]
}
