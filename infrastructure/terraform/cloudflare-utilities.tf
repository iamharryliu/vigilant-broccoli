# utilities.harryliu.dev — Cloudflare Pages site (project + deploys owned by the
# nx `utilities-ui` deploy targets via wrangler). Points at the
# production-utilities-ui project. Terraform owns the custom domain and its DNS.

resource "cloudflare_pages_domain" "utilities" {
  account_id   = var.cloudflare_account_id
  project_name = var.utilities_pages_project
  name         = var.utilities_domain
}

resource "cloudflare_dns_record" "utilities" {
  zone_id = var.cloudflare_zone_id
  name    = var.utilities_domain
  content = var.utilities_pages_subdomain
  type    = "CNAME"
  ttl     = 1
  proxied = true
}
