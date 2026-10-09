# calendars.harryliu.dev — Cloudflare Pages site (project + deploys owned by the
# nx `calendars` deploy targets via wrangler). Points at the
# production-calendars project. Terraform owns the custom domain and its DNS.

resource "cloudflare_pages_domain" "calendars" {
  account_id   = var.cloudflare_account_id
  project_name = var.calendars_pages_project
  name         = var.calendars_domain
}

resource "cloudflare_dns_record" "calendars" {
  zone_id = var.cloudflare_zone_id
  name    = var.calendars_domain
  content = var.calendars_pages_subdomain
  type    = "CNAME"
  ttl     = 1
  proxied = true
}
