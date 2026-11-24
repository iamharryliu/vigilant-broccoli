locals {
  collaboration_pages_apps = toset(["findme"])
}

# Hostnames come from local.vb_app_domains in the vigilant-broccoli.app zone. The old
# harryliu.dev record and Pages domain are removed with no redirect.
resource "cloudflare_pages_domain" "collaboration_app" {
  for_each     = local.collaboration_pages_apps
  account_id   = var.cloudflare_account_id
  project_name = "production-${each.key}"
  name         = local.vb_app_domains[each.key]
}

# Preserve existing DNS records during the Vercel-to-Pages cutover.
moved {
  from = cloudflare_dns_record.vercel_app["findme"]
  to   = cloudflare_dns_record.collaboration_app["findme"]
}

resource "cloudflare_dns_record" "collaboration_app" {
  for_each = local.collaboration_pages_apps
  zone_id  = data.cloudflare_zones.vigilant_broccoli.result[0].id
  name     = local.vb_app_domains[each.key]
  content  = "production-${each.key}.pages.dev"
  type     = "CNAME"
  ttl      = 1
  proxied  = true
}
