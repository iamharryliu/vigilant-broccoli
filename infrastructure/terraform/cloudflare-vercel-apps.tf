# Application subdomains of harryliu.dev and vigilant-broccoli.app — Vercel
# apps (projects and deploys owned by the nx deploy targets). Terraform owns
# only the DNS; post-apply attaches domains to existing production and staging
# Vercel projects. DNS-only so Vercel can issue and renew its own certificate.
# Moving an app between zones replaces its records with no redirect.

locals {
  vercel_app_subdomains = {
    weather-next           = "weather.harryliu.dev"
    balloono               = "balloono.harryliu.dev"
    vb-manager-next-mobile = "manager.harryliu.dev"
    hearth                 = "hearth.harryliu.dev"
    chat                   = "chat.harryliu.dev"
    tasks-next             = "tasks.harryliu.dev"
  }
  vb_app_vercel_subdomains = {
    gravity-guy = "gravity-guy.${var.vigilant_broccoli_domain}"
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

resource "cloudflare_dns_record" "vb_app_vercel_app" {
  for_each = local.vb_app_vercel_subdomains

  zone_id = data.cloudflare_zones.vigilant_broccoli.result[0].id
  name    = each.value
  content = "cname.vercel-dns.com"
  type    = "CNAME"
  ttl     = 1
  proxied = false
}

# Read by post-apply.sh, which attaches each domain to its production
# Vercel project via the API — so a new entry here only needs the matching
# `production-<key>` project to already exist (ensureProjectExists in
# deploy-vercel.ts creates it on first deploy). Both zones merge here so the
# script needs no per-zone handling.
output "vercel_app_subdomains" {
  value = merge(local.vercel_app_subdomains, local.vb_app_vercel_subdomains)
}

locals {
  staging_vercel_app_subdomains = {
    for project, domain in local.vercel_app_subdomains : project => "staging-${domain}"
  }
  staging_vb_app_vercel_subdomains = {
    for project, domain in local.vb_app_vercel_subdomains : project => "staging-${domain}"
  }
}

resource "cloudflare_dns_record" "staging_vercel_app" {
  for_each = local.staging_vercel_app_subdomains
  zone_id  = var.cloudflare_zone_id
  name     = each.value
  content  = "cname.vercel-dns.com"
  type     = "CNAME"
  ttl      = 1
  proxied  = false
}

resource "cloudflare_dns_record" "staging_vb_app_vercel_app" {
  for_each = local.staging_vb_app_vercel_subdomains
  zone_id  = data.cloudflare_zones.vigilant_broccoli.result[0].id
  name     = each.value
  content  = "cname.vercel-dns.com"
  type     = "CNAME"
  ttl      = 1
  proxied  = false
}

output "staging_vercel_app_subdomains" {
  value = merge(local.staging_vercel_app_subdomains, local.staging_vb_app_vercel_subdomains)
}
