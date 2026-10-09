# status.harryliu.dev: a Cloudflare Worker that reverse-proxies the pages-index
# GitHub Pages deployment at projects.harryliu.dev. The app renders StatusPage
# at the root when it runs on this hostname; the Worker only carries the HTML
# and static assets, preserving upstream status codes and content types.
# Upptime's generated history site is separate, at uptime.harryliu.dev.

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
      text = "https://${var.projects_domain}"
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
  zone_id    = var.cloudflare_zone_id
  hostname   = var.status_domain
  service    = cloudflare_workers_script.status_proxy.script_name
}
