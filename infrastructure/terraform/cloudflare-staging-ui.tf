locals {
  staging_pages_projects = toset([
    "staging-bookmarks-react",
    "staging-calendars",
    "staging-cloud-8-skate-react",
    "staging-component-library",
    "staging-context-md",
    "staging-docs-md",
    "staging-findme",
    "staging-grind-75-react",
    "staging-harryliu-dev-react",
    "staging-photography-react",
    "staging-pomodoro-react",
    "staging-text-tools-ui",
    "staging-utilities-ui",
    "staging-waiting-games",
    "staging-whiteboard",
  ])

  staging_pages_domains = {
    staging-calendars          = "staging-calendar.harryliu.dev"
    staging-component-library  = "staging-components.${var.vigilant_broccoli_domain}"
    staging-context-md         = "staging-context.${var.vigilant_broccoli_domain}"
    staging-docs-md            = "staging-docs.${var.vigilant_broccoli_domain}"
    staging-findme             = "staging-findme.harryliu.dev"
    staging-grind-75-react     = "staging-grind-75.${var.vigilant_broccoli_domain}"
    staging-harryliu-dev-react = "staging.harryliu.dev"
    staging-photography-react  = "staging-photography.harryliu.dev"
    staging-pomodoro-react     = "staging-pomodoro.${var.vigilant_broccoli_domain}"
    staging-text-tools-ui      = "staging-text-tools.${var.vigilant_broccoli_domain}"
    staging-utilities-ui       = "staging-utilities.${var.vigilant_broccoli_domain}"
    staging-waiting-games      = "staging-waiting.${var.vigilant_broccoli_domain}"
    staging-whiteboard         = "staging-whiteboard.${var.vigilant_broccoli_domain}"
  }
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
  destinations = concat([
    { type = "public", uri = "${each.value}.pages.dev" },
    { type = "public", uri = "*.${each.value}.pages.dev" },
    ], contains(keys(local.staging_pages_domains), each.key) ? [
    { type = "public", uri = local.staging_pages_domains[each.key] },
    ] : [], each.key == local.staging_cloud8skate_project ? [
    { type = "public", uri = local.staging_cloud8skate_domain },
    ] : [], each.key == local.staging_bookmarks_project ? [
    { type = "public", uri = local.staging_bookmarks_domain },
  ] : [])
  policies = [
    { id = cloudflare_zero_trust_access_policy.staging_ui_owner.id, precedence = 1 },
  ]
}

# Protect the new hostname before attaching or routing traffic to it.
resource "cloudflare_pages_domain" "staging_ui" {
  for_each     = local.staging_pages_domains
  account_id   = var.cloudflare_account_id
  project_name = each.key
  name         = each.value
  depends_on   = [cloudflare_zero_trust_access_application.staging_pages]
}

resource "cloudflare_dns_record" "staging_ui" {
  for_each   = local.staging_pages_domains
  zone_id    = endswith(each.value, ".${var.vigilant_broccoli_domain}") ? data.cloudflare_zones.vigilant_broccoli.result[0].id : var.cloudflare_zone_id
  name       = each.value
  content    = "${each.key}.pages.dev"
  type       = "CNAME"
  ttl        = 1
  proxied    = true
  depends_on = [cloudflare_zero_trust_access_application.staging_pages]
}
