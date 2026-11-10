# Application subdomains of harryliu.dev — Vercel
# apps (projects and deploys owned by the nx deploy targets). Terraform owns
# only the DNS; post-apply attaches domains to existing production and staging
# Vercel projects. DNS-only so Vercel can issue and renew its own certificate.
# Chat is the exception, proxied behind Cloudflare Access (cloudflare-chat.tf).

locals {
  vercel_app_subdomains = {
    weather-next           = "weather.harryliu.dev"
    balloono               = "balloono.harryliu.dev"
    vb-manager-next-mobile = "manager.harryliu.dev"
    hearth                 = "hearth.harryliu.dev"
    gravity-guy            = "gravity-guy.harryliu.dev"
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

# Read by post-apply.sh, which attaches each domain to its production
# Vercel project via the API — so a new entry here only needs the matching
# `production-<key>` project to already exist (ensureProjectExists in
# deploy-vercel.ts creates it on first deploy). Chat's proxied records live in
# cloudflare-chat.tf; only its domain attachment joins this output.
output "vercel_app_subdomains" {
  value = merge(local.vercel_app_subdomains, { chat = local.chat_domains.production })
}

locals {
  staging_vercel_app_subdomains = {
    for project, domain in local.vercel_app_subdomains : project => "staging-${domain}"
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

output "staging_vercel_app_subdomains" {
  value = merge(local.staging_vercel_app_subdomains, { chat = local.chat_domains.staging })
}
