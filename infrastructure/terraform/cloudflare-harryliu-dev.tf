# harryliu.dev — Cloudflare Pages site (project + deploys owned by the nx
# `personal-website-react` deploy target via wrangler). Terraform owns the
# custom domain attachment and its DNS, pointing at the `production-harryliu-dev-react`
# project. The zone's redirect ruleset also sends www to the apex and the legacy
# projects.harryliu.dev host to projects.vigilant-broccoli.app.

import {
  to = cloudflare_dns_record.harryliu_dev_apex
  id = "${var.cloudflare_zone_id}/6072fab7c87f7aabda091bbe5a3249f7"
}

resource "cloudflare_pages_domain" "harryliu_dev" {
  account_id   = var.cloudflare_account_id
  project_name = var.harryliu_dev_pages_project
  name         = var.harryliu_dev_domain
}

resource "cloudflare_dns_record" "harryliu_dev_apex" {
  zone_id = var.cloudflare_zone_id
  name    = var.harryliu_dev_domain
  content = var.harryliu_dev_pages_subdomain
  type    = "CNAME"
  ttl     = 1
  proxied = true
}

import {
  to = cloudflare_dns_record.harryliu_dev_www
  id = "${var.cloudflare_zone_id}/2bcd5845a5fb77d7af9dd376b16b5490"
}

resource "cloudflare_dns_record" "harryliu_dev_www" {
  zone_id = var.cloudflare_zone_id
  name    = "www.${var.harryliu_dev_domain}"
  content = var.harryliu_dev_domain
  type    = "CNAME"
  ttl     = 1
  proxied = true
}

resource "cloudflare_ruleset" "harryliu_dev_redirects" {
  zone_id = var.cloudflare_zone_id
  name    = "${var.harryliu_dev_domain} redirects"
  kind    = "zone"
  phase   = "http_request_dynamic_redirect"

  rules = [{
    ref         = "www_to_apex"
    description = "Redirect www to apex"
    expression  = "(http.host eq \"www.${var.harryliu_dev_domain}\")"
    action      = "redirect"
    action_parameters = {
      from_value = {
        status_code = 301
        target_url = {
          expression = "concat(\"https://${var.harryliu_dev_domain}\", http.request.uri.path)"
        }
        preserve_query_string = true
      }
    }
    }, {
    ref         = "projects_to_vigilant_broccoli"
    description = "Redirect projects.${var.harryliu_dev_domain} to projects.${var.vigilant_broccoli_domain}"
    expression  = "(http.host eq \"projects.${var.harryliu_dev_domain}\")"
    action      = "redirect"
    action_parameters = {
      from_value = {
        status_code = 301
        target_url = {
          expression = "concat(\"https://${local.vb_app_domains.projects}\", http.request.uri.path)"
        }
        preserve_query_string = true
      }
    }
  }]
}

# Legacy project-overview host, kept only so old links reach the redirect above.
# Proxied because redirect rules only run on proxied traffic; the GitHub Pages
# target is never fetched.
resource "cloudflare_dns_record" "harryliu_dev_projects" {
  zone_id = var.cloudflare_zone_id
  name    = "projects.${var.harryliu_dev_domain}"
  content = "${var.github_owner}.github.io"
  type    = "CNAME"
  ttl     = 1
  proxied = true
}
