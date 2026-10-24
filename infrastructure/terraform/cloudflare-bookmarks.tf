# bookmarks.harryliu.dev — Cloudflare Pages site (project + deploys owned by the
# `deploy` workflow's deploy-apps job via wrangler). Points at the
# production-bookmarks-react project. Terraform owns the custom domain and its DNS.
# Personal bookmarks — no Access gating.

resource "cloudflare_pages_domain" "bookmarks" {
  account_id   = var.cloudflare_account_id
  project_name = var.bookmarks_pages_project
  name         = var.bookmarks_domain
}

resource "cloudflare_dns_record" "bookmarks" {
  zone_id = var.cloudflare_zone_id
  name    = var.bookmarks_domain
  content = var.bookmarks_pages_subdomain
  type    = "CNAME"
  ttl     = 1
  proxied = true
}
