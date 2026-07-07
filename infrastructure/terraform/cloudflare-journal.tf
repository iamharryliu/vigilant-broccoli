# journal.harryliu.dev — Cloudflare Pages site (project + deploys owned by the
# `cron-deploy-journal` workflow via wrangler). Terraform owns the custom domain,
# its DNS, and the Zero Trust Access policy that gates it.

resource "cloudflare_pages_domain" "journal" {
  account_id   = var.cloudflare_account_id
  project_name = var.journal_pages_project
  name         = var.journal_domain
}

resource "cloudflare_dns_record" "journal" {
  zone_id = var.cloudflare_zone_id
  name    = var.journal_domain
  content = var.journal_pages_subdomain
  type    = "CNAME"
  ttl     = 1
  proxied = true
}

resource "cloudflare_zero_trust_access_policy" "journal" {
  account_id = var.cloudflare_account_id
  name       = "journal-allow-owner"
  decision   = "allow"
  include    = [for email in var.journal_allowed_emails : { email = { email = email } }]
}

resource "cloudflare_zero_trust_access_application" "journal" {
  account_id       = var.cloudflare_account_id
  name             = "journal"
  type             = "self_hosted"
  session_duration = "24h"

  # Gate every hostname the site is reachable on, not just the custom domain.
  # A Pages project is always served on its <project>.pages.dev alias and a
  # per-deploy <hash>.<project>.pages.dev URL — both bypass Access unless
  # explicitly covered here, which would expose the notes publicly.
  destinations = [
    { type = "public", uri = var.journal_domain },
    { type = "public", uri = var.journal_pages_subdomain },
    { type = "public", uri = "*.${var.journal_pages_subdomain}" },
  ]

  policies = [{
    id         = cloudflare_zero_trust_access_policy.journal.id
    precedence = 1
  }]
}
