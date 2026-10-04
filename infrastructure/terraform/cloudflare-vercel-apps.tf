# findme.harryliu.dev and whiteboard.harryliu.dev — Vercel apps (projects and
# deploys owned by the nx deploy targets). Terraform owns only the DNS; the
# domain must also be added to each production Vercel project. DNS-only so
# Vercel can issue and renew its own certificate.

locals {
  vercel_app_subdomains = {
    findme     = "findme.harryliu.dev"
    whiteboard = "whiteboard.harryliu.dev"
  }
}

resource "cloudflare_dns_record" "vercel_app" {
  for_each = local.vercel_app_subdomains

  zone_id = var.cloudflare_zone_id
  name    = each.value
  content = "cname.vercel-dns.com"
  type    = "CNAME"
  ttl     = 1
  proxied = false
}
