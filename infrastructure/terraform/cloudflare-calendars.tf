# calendar.harryliu.dev — Cloudflare Pages site (project + deploys owned by the
# nx `calendars` deploy targets via wrangler). Points at the
# production-calendars project. Terraform owns the custom domain and its DNS.
#
# The addresses are `calendar`, not the former `calendars`: a Pages domain name
# is immutable, so renaming in place would destroy the retired hostname before
# the new one exists. Distinct addresses let a targeted apply create the new
# attachment first — see docs/infrastructure/network-management.md#domain-cutover.

resource "cloudflare_pages_domain" "calendar" {
  account_id   = var.cloudflare_account_id
  project_name = var.calendars_pages_project
  name         = var.calendars_domain
}

resource "cloudflare_dns_record" "calendar" {
  zone_id = var.cloudflare_zone_id
  name    = var.calendars_domain
  content = var.calendars_pages_subdomain
  type    = "CNAME"
  ttl     = 1
  proxied = true
}
