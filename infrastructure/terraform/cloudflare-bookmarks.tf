# bookmarks.vigilant-broccoli.app — Cloudflare Pages site (project + deploys owned
# by the `deploy` workflow's deploy-apps job via wrangler). Points at the
# production-bookmarks-react project. Terraform owns the custom domain and its DNS.
# The vigilant-broccoli.app zone is a separate Cloudflare zone, looked up by name,
# and must exist in the account before the first apply. The old
# bookmarks.harryliu.dev and staging-bookmarks.harryliu.dev records and Pages
# domains are removed with no redirect.
# Personal bookmarks — no Access gating on production.

data "cloudflare_zones" "vigilant_broccoli" {
  name = var.vigilant_broccoli_domain
}

resource "cloudflare_pages_domain" "bookmarks" {
  account_id   = var.cloudflare_account_id
  project_name = var.bookmarks_pages_project
  name         = var.bookmarks_domain
}

resource "cloudflare_dns_record" "bookmarks" {
  zone_id = data.cloudflare_zones.vigilant_broccoli.result[0].id
  name    = var.bookmarks_domain
  content = var.bookmarks_pages_subdomain
  type    = "CNAME"
  ttl     = 1
  proxied = true
}

# Staging lives in this zone, not harryliu.dev, so it is outside
# `staging_pages_domains`; its Access destination is added in
# cloudflare-staging-ui.tf.
locals {
  staging_bookmarks_project = "staging-bookmarks-react"
  staging_bookmarks_domain  = "staging-bookmarks.${var.vigilant_broccoli_domain}"
}

resource "cloudflare_pages_domain" "staging_bookmarks" {
  account_id   = var.cloudflare_account_id
  project_name = local.staging_bookmarks_project
  name         = local.staging_bookmarks_domain
  depends_on   = [cloudflare_zero_trust_access_application.staging_pages]
}

resource "cloudflare_dns_record" "staging_bookmarks" {
  zone_id    = data.cloudflare_zones.vigilant_broccoli.result[0].id
  name       = local.staging_bookmarks_domain
  content    = "${local.staging_bookmarks_project}.pages.dev"
  type       = "CNAME"
  ttl        = 1
  proxied    = true
  depends_on = [cloudflare_zero_trust_access_application.staging_pages]
}
