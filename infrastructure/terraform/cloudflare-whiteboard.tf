# whiteboard.vigilant-broccoli.app — Cloudflare Pages site (project + deploys owned
# by the nx `whiteboard` deploy targets via wrangler). Points at the
# production-whiteboard project. Terraform owns the custom domain and its DNS.
# The vigilant-broccoli.app zone is a separate Cloudflare zone, looked up by name
# in cloudflare-vigilant-broccoli-app.tf. The old harryliu.dev record and Pages domain are
# removed with no redirect.

resource "cloudflare_pages_domain" "whiteboard" {
  account_id   = var.cloudflare_account_id
  project_name = "production-whiteboard"
  name         = local.vb_app_domains.whiteboard
}

resource "cloudflare_dns_record" "whiteboard" {
  zone_id = data.cloudflare_zones.vigilant_broccoli.result[0].id
  name    = local.vb_app_domains.whiteboard
  content = "production-whiteboard.pages.dev"
  type    = "CNAME"
  ttl     = 1
  proxied = true
}
