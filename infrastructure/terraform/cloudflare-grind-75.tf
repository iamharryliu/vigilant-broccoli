# grind-75.vigilant-broccoli.app — Cloudflare Pages site (project + deploys owned by the
# `deploy` workflow's deploy-apps job via wrangler). Points at the
# production-grind-75-react project. Terraform owns the custom domain and its DNS.
# Public solutions — no Access gating.
# The vigilant-broccoli.app zone is a separate Cloudflare zone, looked up by name
# in cloudflare-vigilant-broccoli-app.tf. The old harryliu.dev record and Pages domain are
# removed with no redirect.

resource "cloudflare_pages_domain" "grind_75" {
  account_id   = var.cloudflare_account_id
  project_name = var.grind_75_pages_project
  name         = local.vb_app_domains.grind_75
}

resource "cloudflare_dns_record" "grind_75" {
  zone_id = data.cloudflare_zones.vigilant_broccoli.result[0].id
  name    = local.vb_app_domains.grind_75
  content = var.grind_75_pages_subdomain
  type    = "CNAME"
  ttl     = 1
  proxied = true
}
