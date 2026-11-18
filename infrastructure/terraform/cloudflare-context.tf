# context.vigilant-broccoli.app — Cloudflare Pages site (project + deploys owned by the
# `deploy-context-md` workflow via wrangler). Points at the
# production-context-md project. Terraform owns the custom domain and its DNS.
# Public agent context — no Access gating.
# The vigilant-broccoli.app zone is a separate Cloudflare zone, looked up by name
# in cloudflare-vigilant-broccoli-app.tf. The old harryliu.dev record and Pages domain are
# removed with no redirect.

resource "cloudflare_pages_domain" "context" {
  account_id   = var.cloudflare_account_id
  project_name = var.context_pages_project
  name         = local.vb_app_domains.context
}

resource "cloudflare_dns_record" "context" {
  zone_id = data.cloudflare_zones.vigilant_broccoli.result[0].id
  name    = local.vb_app_domains.context
  content = var.context_pages_subdomain
  type    = "CNAME"
  ttl     = 1
  proxied = true
}
