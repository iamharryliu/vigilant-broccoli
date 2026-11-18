# utilities.vigilant-broccoli.app — Cloudflare Pages site (project + deploys owned by the
# nx `utilities-ui` deploy targets via wrangler). Points at the
# production-utilities-ui project. Terraform owns the custom domain and its DNS.
# The vigilant-broccoli.app zone is a separate Cloudflare zone, looked up by name
# in cloudflare-vigilant-broccoli-app.tf. The old harryliu.dev record and Pages domain are
# removed with no redirect.

resource "cloudflare_pages_domain" "utilities" {
  account_id   = var.cloudflare_account_id
  project_name = var.utilities_pages_project
  name         = local.vb_app_domains.utilities
}

resource "cloudflare_dns_record" "utilities" {
  zone_id = data.cloudflare_zones.vigilant_broccoli.result[0].id
  name    = local.vb_app_domains.utilities
  content = var.utilities_pages_subdomain
  type    = "CNAME"
  ttl     = 1
  proxied = true
}
