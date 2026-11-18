# pomodoro.vigilant-broccoli.app — Cloudflare Pages site (project + deploys owned by the
# `deploy` workflow's deploy-apps job via wrangler). Points at the
# production-pomodoro-react project. Terraform owns the custom domain and its DNS.
# Static timer — no Access gating.
# The vigilant-broccoli.app zone is a separate Cloudflare zone, looked up by name
# in cloudflare-vigilant-broccoli-app.tf. The old harryliu.dev record and Pages domain are
# removed with no redirect.

resource "cloudflare_pages_domain" "pomodoro" {
  account_id   = var.cloudflare_account_id
  project_name = var.pomodoro_pages_project
  name         = local.vb_app_domains.pomodoro
}

resource "cloudflare_dns_record" "pomodoro" {
  zone_id = data.cloudflare_zones.vigilant_broccoli.result[0].id
  name    = local.vb_app_domains.pomodoro
  content = var.pomodoro_pages_subdomain
  type    = "CNAME"
  ttl     = 1
  proxied = true
}
