# projects.vigilant-broccoli.app — the pages-index GitHub Pages site. DNS-only so
# GitHub Pages can issue its certificate; `github_repository_pages` in github.tf
# sets the Pages custom domain from this record. Also the upstream of the
# status-proxy Worker (cloudflare-status.tf). The old projects.harryliu.dev host
# 301-redirects here (cloudflare-harryliu-dev.tf).

resource "cloudflare_dns_record" "projects" {
  zone_id = data.cloudflare_zones.vigilant_broccoli.result[0].id
  name    = local.vb_app_domains.projects
  content = "${var.github_owner}.github.io"
  type    = "CNAME"
  ttl     = 1
  proxied = false
}
