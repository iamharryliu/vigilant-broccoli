# docs.harryliu.dev — Cloudflare Pages site (project + deploys owned by the
# `deploy` workflow's deploy-apps job via wrangler). Terraform owns the custom
# domain and its DNS. Public docs, unlike journal — no Access gating.

resource "cloudflare_pages_domain" "docs" {
  account_id   = var.cloudflare_account_id
  project_name = var.docs_pages_project
  name         = var.docs_domain
}

resource "cloudflare_dns_record" "docs" {
  zone_id = var.cloudflare_zone_id
  name    = var.docs_domain
  content = var.docs_pages_subdomain
  type    = "CNAME"
  ttl     = 1
  proxied = true
}
