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
}

variable "staging_ui_allowed_emails" {
  description = "Identities allowed to open staging Pages deployments."
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
  ]
}
