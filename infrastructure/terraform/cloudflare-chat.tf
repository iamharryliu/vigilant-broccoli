# Chat (apps/ui/chat) — Vercel projects `production-chat` / `staging-chat`,
# both gated by Cloudflare Access instead of Vercel Authentication. Unlike the
# DNS-only records in cloudflare-vercel-apps.tf these are proxied, so Access
# can sit in front of them. The app re-verifies the Access JWT itself because
# its *.vercel.app aliases skip Cloudflare.

locals {
  chat_domains = {
    production = "chat.harryliu.dev"
    staging    = "staging-chat.harryliu.dev"
  }

  # Vercel issues and renews the origin certificate over HTTP-01 through the
  # proxy, so these paths must reach Vercel without an Access login.
  chat_vercel_challenge_paths = [
    ".well-known/acme-challenge",
    ".well-known/vercel",
  ]
}

resource "cloudflare_zero_trust_access_application" "chat" {
  for_each         = local.chat_domains
  account_id       = var.cloudflare_account_id
  name             = "${each.key}-chat"
  domain           = each.value
  type             = "self_hosted"
  session_duration = "24h"
  # Keeps the Access cookie off cross-site POSTs to the publish route.
  same_site_cookie_attribute = "lax"
  policies = [
    { id = cloudflare_zero_trust_access_policy.staging_ui_owner.id, precedence = 1 },
  ]
}

resource "cloudflare_zero_trust_access_policy" "chat_vercel_challenge" {
  account_id = var.cloudflare_account_id
  name       = "chat-vercel-challenge-bypass"
  decision   = "bypass"
  include    = [{ everyone = {} }]
}

resource "cloudflare_zero_trust_access_application" "chat_vercel_challenge" {
  account_id = var.cloudflare_account_id
  name       = "chat-vercel-challenge"
  domain     = "${local.chat_domains.production}/${local.chat_vercel_challenge_paths[0]}"
  type       = "self_hosted"
  destinations = flatten([
    for domain in values(local.chat_domains) : [
      for path in local.chat_vercel_challenge_paths : { type = "public", uri = "${domain}/${path}" }
    ]
  ])
  policies = [
    { id = cloudflare_zero_trust_access_policy.chat_vercel_challenge.id, precedence = 1 },
  ]
}

# Protect the hostname before routing traffic to it.
resource "cloudflare_dns_record" "chat" {
  for_each = local.chat_domains
  zone_id  = var.cloudflare_zone_id
  name     = each.value
  content  = "cname.vercel-dns.com"
  type     = "CNAME"
  ttl      = 1
  proxied  = true
  depends_on = [
    cloudflare_zero_trust_access_application.chat,
    cloudflare_zero_trust_access_application.chat_vercel_challenge,
  ]
}

# Read by post-apply.sh, which writes each audience to Vault as
# CHAT_<ENVIRONMENT>_CF_ACCESS_AUD for deploy-vercel.ts.
output "chat_access_aud" {
  value = { for env, app in cloudflare_zero_trust_access_application.chat : env => app.aud }
}
