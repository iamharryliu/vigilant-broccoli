# grind-75.harryliu.dev — Cloudflare Pages site (project + deploys owned by the
# `deploy` workflow's deploy-apps job via wrangler). Points at the
# production-grind-75-react project. Terraform owns the custom domain and its DNS.
# Public solutions — no Access gating.

resource "cloudflare_pages_domain" "grind_75" {
  account_id   = var.cloudflare_account_id
  project_name = var.grind_75_pages_project
  name         = var.grind_75_domain
}

resource "cloudflare_dns_record" "grind_75" {
  zone_id = var.cloudflare_zone_id
  name    = var.grind_75_domain
  content = var.grind_75_pages_subdomain
  type    = "CNAME"
  ttl     = 1
  proxied = true
}
