# context.harryliu.dev — Cloudflare Pages site (project + deploys owned by the
# `deploy-context-md` workflow via wrangler). Points at the
# production-context-md project. Terraform owns the custom domain and its DNS.
# Public agent context — no Access gating.

resource "cloudflare_pages_domain" "context" {
  account_id   = var.cloudflare_account_id
  project_name = var.context_pages_project
  name         = var.context_domain
}

resource "cloudflare_dns_record" "context" {
  zone_id = var.cloudflare_zone_id
  name    = var.context_domain
  content = var.context_pages_subdomain
  type    = "CNAME"
  ttl     = 1
  proxied = true
}
