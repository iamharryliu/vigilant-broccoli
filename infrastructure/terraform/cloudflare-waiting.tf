# waiting.harryliu.dev — Cloudflare Pages site (project + deploys owned by the
# nx `waiting-games` deploy targets via wrangler). Points at the
# production-waiting-games project. Terraform owns the custom domain and its DNS.

resource "cloudflare_pages_domain" "waiting" {
  account_id   = var.cloudflare_account_id
  project_name = var.waiting_pages_project
  name         = var.waiting_domain
}

resource "cloudflare_dns_record" "waiting" {
  zone_id = var.cloudflare_zone_id
  name    = var.waiting_domain
  content = var.waiting_pages_subdomain
  type    = "CNAME"
  ttl     = 1
  proxied = true
}
