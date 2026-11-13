# photography.harryliu.dev — Cloudflare Pages site (project + deploys owned by the
# `deploy` workflow's deploy-apps job via wrangler). Points at the
# production-photography-react project. Terraform owns the custom domain and its DNS.
# Public gallery — no Access gating; albums come from vb-express's public
# photography endpoints.

resource "cloudflare_pages_domain" "photography" {
  account_id   = var.cloudflare_account_id
  project_name = var.photography_pages_project
  name         = var.photography_domain
}

resource "cloudflare_dns_record" "photography" {
  zone_id = var.cloudflare_zone_id
  name    = var.photography_domain
  content = var.photography_pages_subdomain
  type    = "CNAME"
  ttl     = 1
  proxied = true
}
