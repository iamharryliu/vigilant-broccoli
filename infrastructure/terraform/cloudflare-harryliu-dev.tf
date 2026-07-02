import {
  to = cloudflare_dns_record.harryliu_dev_apex
  id = "${var.cloudflare_zone_id}/6072fab7c87f7aabda091bbe5a3249f7"
}

resource "cloudflare_dns_record" "harryliu_dev_apex" {
  zone_id = var.cloudflare_zone_id
  name    = "harryliu.dev"
  content = "harryliu-design-angular.pages.dev"
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
  name    = "www.harryliu.dev"
  content = "harryliu.dev"
  type    = "CNAME"
  ttl     = 1
  proxied = true
}

resource "cloudflare_ruleset" "harryliu_dev_redirects" {
  zone_id = var.cloudflare_zone_id
  name    = "harryliu.dev redirects"
  kind    = "zone"
  phase   = "http_request_dynamic_redirect"

  rules = [{
    ref         = "www_to_apex"
    description = "Redirect www to apex"
    expression  = "(http.host eq \"www.harryliu.dev\")"
    action      = "redirect"
    action_parameters = {
      from_value = {
        status_code = 301
        target_url = {
          expression = "concat(\"https://harryliu.dev\", http.request.uri.path)"
        }
        preserve_query_string = true
      }
    }
  }]
}
