# status, career, deployments and games hostnames share a
# Cloudflare Worker that reverse-proxies the projects-hub GitHub Pages
# deployment at projects.vigilant-broccoli.app. The app renders StatusPage (status
# host), CareerPage (career host) or DeploymentsPage (deployments host) at the
# root (GamesPage on the games host); the Worker only
# carries the HTML and static assets, preserving upstream status codes and
# content types. The status, deployments and games hosts live in the vigilant-broccoli.app
# zone (cloudflare-vigilant-broccoli-app.tf); career stays in harryliu.dev.
# Upptime's generated history site is separate, at uptime.vigilant-broccoli.app.

resource "cloudflare_workers_script" "status_proxy" {
  account_id  = var.cloudflare_account_id
  script_name = "status-proxy"

  content_file   = "${path.module}/../cloudflare-workers/status-proxy/index.js"
  content_sha256 = filesha256("${path.module}/../cloudflare-workers/status-proxy/index.js")
  main_module    = "index.js"

  compatibility_date = "2026-07-01"

  bindings = [
    {
      name = "UPSTREAM_ORIGIN"
      type = "plain_text"
      text = "https://${cloudflare_dns_record.projects.name}"
    },
  ]

  # Spelled out in full for the reason documented in cloudflare-nx-cache.tf and
  # this directory's CONTEXT.md.
  observability = {
    enabled            = true
    head_sampling_rate = 1

    logs = {
      enabled            = true
      head_sampling_rate = 1
      invocation_logs    = true
      persist            = true
    }

    traces = {
      enabled            = false
      head_sampling_rate = 1
      persist            = true
    }
  }
}

resource "cloudflare_workers_custom_domain" "status" {
  account_id = var.cloudflare_account_id
  zone_id    = data.cloudflare_zones.vigilant_broccoli.result[0].id
  hostname   = local.vb_app_domains.status
  service    = cloudflare_workers_script.status_proxy.script_name
}

resource "cloudflare_workers_custom_domain" "career" {
  account_id = var.cloudflare_account_id
  zone_id    = var.cloudflare_zone_id
  hostname   = var.career_domain
  service    = cloudflare_workers_script.status_proxy.script_name
}

resource "cloudflare_workers_custom_domain" "deployments" {
  account_id = var.cloudflare_account_id
  zone_id    = data.cloudflare_zones.vigilant_broccoli.result[0].id
  hostname   = local.vb_app_domains.deployments
  service    = cloudflare_workers_script.status_proxy.script_name
}

resource "cloudflare_workers_custom_domain" "games" {
  account_id = var.cloudflare_account_id
  zone_id    = data.cloudflare_zones.vigilant_broccoli.result[0].id
  hostname   = local.vb_app_domains.games
  service    = cloudflare_workers_script.status_proxy.script_name
}
