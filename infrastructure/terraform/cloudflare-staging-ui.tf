locals {
  staging_pages_projects = toset([
    "staging-calendars",
    "staging-cloud-8-skate-react",
    "staging-component-library",
    "staging-context-md",
    "staging-docs-md",
    "staging-harryliu-dev-react",
    "staging-links-react",
    "staging-utilities-ui",
    "staging-waiting-games",
  ])
  staging_vercel_domains = {
    balloono               = "staging-balloono.harryliu.dev"
    findme                 = "staging-findme.harryliu.dev"
    hearth                 = "staging-hearth.harryliu.dev"
    vb-manager-next-mobile = "staging-vb-manager-next-mobile.harryliu.dev"
    weather-next           = "staging-weather.harryliu.dev"
    whiteboard             = "staging-whiteboard.harryliu.dev"
  }
}

data "cloudflare_zero_trust_organization" "staging_ui" {
  account_id = var.cloudflare_account_id
}

variable "staging_ui_allowed_emails" {
  description = "Identities allowed to open staging UI deployments."
  type        = list(string)
  default     = ["harryliu1995@gmail.com"]

  validation {
    condition     = length(var.staging_ui_allowed_emails) > 0
    error_message = "Staging UI access must have at least one allowed identity."
  }
}

resource "cloudflare_zero_trust_access_policy" "staging_ui_owner" {
  account_id = var.cloudflare_account_id
  name       = "staging-ui-allow-owner"
  decision   = "allow"
  include    = [for email in var.staging_ui_allowed_emails : { email = { email = email } }]
}

resource "cloudflare_zero_trust_access_service_token" "staging_ui_monitor" {
  account_id = var.cloudflare_account_id
  name       = "staging-ui-upptime"
  duration   = "8760h"
}

resource "cloudflare_zero_trust_access_policy" "staging_ui_monitor" {
  account_id = var.cloudflare_account_id
  name       = "staging-ui-allow-upptime"
  decision   = "non_identity"
  include = [{
    service_token = { token_id = cloudflare_zero_trust_access_service_token.staging_ui_monitor.id }
  }]
}

# The project root and immutable/branch deployment aliases are separate hosts.
resource "cloudflare_zero_trust_access_application" "staging_pages" {
  for_each         = local.staging_pages_projects
  account_id       = var.cloudflare_account_id
  name             = each.value
  domain           = "${each.value}.pages.dev"
  type             = "self_hosted"
  session_duration = "24h"
  destinations = [
    { type = "public", uri = "${each.value}.pages.dev" },
    { type = "public", uri = "*.${each.value}.pages.dev" },
  ]
  policies = [
    { id = cloudflare_zero_trust_access_policy.staging_ui_owner.id, precedence = 1 },
    { id = cloudflare_zero_trust_access_policy.staging_ui_monitor.id, precedence = 2 },
  ]
}

resource "cloudflare_dns_record" "staging_vercel" {
  for_each = local.staging_vercel_domains
  zone_id  = var.cloudflare_zone_id
  name     = each.value
  content  = "staging-${each.key}.vercel.app"
  type     = "CNAME"
  ttl      = 1
  proxied  = true
}

resource "cloudflare_zero_trust_access_application" "staging_vercel" {
  for_each         = local.staging_vercel_domains
  account_id       = var.cloudflare_account_id
  name             = "staging-${each.key}"
  domain           = each.value
  type             = "self_hosted"
  session_duration = "24h"
  policies = [
    { id = cloudflare_zero_trust_access_policy.staging_ui_owner.id, precedence = 1 },
    { id = cloudflare_zero_trust_access_policy.staging_ui_monitor.id, precedence = 2 },
  ]
}

output "staging_vercel_domains" {
  value = local.staging_vercel_domains
}

# Public verification metadata, consumed by deploy-vercel.ts through Vault.
output "staging_ui_access_config" {
  value = {
    issuer = "https://${data.cloudflare_zero_trust_organization.staging_ui.auth_domain}"
    apps = { for app, access in cloudflare_zero_trust_access_application.staging_vercel : app => {
      audience = access.aud
      domain   = local.staging_vercel_domains[app]
    } }
  }
}

# Vercel renews origin certificates through HTTP-01 before Next.js handles requests.
resource "cloudflare_zero_trust_access_policy" "staging_vercel_acme" {
  account_id = var.cloudflare_account_id
  name       = "staging-vercel-certificate-validation"
  decision   = "bypass"
  include    = [{ everyone = {} }]
}

resource "cloudflare_zero_trust_access_application" "staging_vercel_acme" {
  for_each   = local.staging_vercel_domains
  account_id = var.cloudflare_account_id
  name       = "staging-${each.key}-certificate-validation"
  domain     = "${each.value}/.well-known/acme-challenge"
  type       = "self_hosted"
  policies = [{
    id         = cloudflare_zero_trust_access_policy.staging_vercel_acme.id
    precedence = 1
  }]
}
