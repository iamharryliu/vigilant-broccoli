locals {
  collaboration_pages_apps = toset(["findme", "whiteboard"])
}

resource "cloudflare_pages_domain" "collaboration_app" {
  for_each     = local.collaboration_pages_apps
  account_id   = var.cloudflare_account_id
  project_name = "production-${each.key}"
  name         = "${each.key}.harryliu.dev"
}

# Preserve existing DNS records during the Vercel-to-Pages cutover.
moved {
  from = cloudflare_dns_record.vercel_app["findme"]
  to   = cloudflare_dns_record.collaboration_app["findme"]
}

moved {
  from = cloudflare_dns_record.vercel_app["whiteboard"]
  to   = cloudflare_dns_record.collaboration_app["whiteboard"]
}

resource "cloudflare_dns_record" "collaboration_app" {
  for_each = local.collaboration_pages_apps
  zone_id  = var.cloudflare_zone_id
  name     = "${each.key}.harryliu.dev"
  content  = "production-${each.key}.pages.dev"
  type     = "CNAME"
  ttl      = 1
  proxied  = true
}
