# links.harryliu.dev — Cloudflare Pages site (project + deploys owned by the
# `deploy` workflow's deploy-apps job via wrangler). Points at the
# production-links-react project. Terraform owns the custom domain and its DNS.
# Public links — no Access gating.

resource "cloudflare_pages_domain" "links" {
  account_id   = var.cloudflare_account_id
  project_name = var.links_pages_project
  name         = var.links_domain
}

resource "cloudflare_dns_record" "links" {
  zone_id = var.cloudflare_zone_id
  name    = var.links_domain
  content = var.links_pages_subdomain
  type    = "CNAME"
  ttl     = 1
  proxied = true
}
