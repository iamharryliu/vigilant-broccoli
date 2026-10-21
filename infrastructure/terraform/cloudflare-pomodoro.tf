# pomodoro.harryliu.dev — Cloudflare Pages site (project + deploys owned by the
# `deploy` workflow's deploy-apps job via wrangler). Points at the
# production-pomodoro-react project. Terraform owns the custom domain and its DNS.
# Static timer — no Access gating.

resource "cloudflare_pages_domain" "pomodoro" {
  account_id   = var.cloudflare_account_id
  project_name = var.pomodoro_pages_project
  name         = var.pomodoro_domain
}

resource "cloudflare_dns_record" "pomodoro" {
  zone_id = var.cloudflare_zone_id
  name    = var.pomodoro_domain
  content = var.pomodoro_pages_subdomain
  type    = "CNAME"
  ttl     = 1
  proxied = true
}
