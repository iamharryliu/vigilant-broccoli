# text-tools.harryliu.dev — Cloudflare Pages site (project + deploys owned by the
# nx `text-tools-ui` deploy targets via wrangler). Points at the
# production-text-tools-ui project. Terraform owns the custom domain and its DNS.

resource "cloudflare_pages_domain" "text_tools" {
  account_id   = var.cloudflare_account_id
  project_name = var.text_tools_pages_project
  name         = var.text_tools_domain
}

resource "cloudflare_dns_record" "text_tools" {
  zone_id = var.cloudflare_zone_id
  name    = var.text_tools_domain
  content = var.text_tools_pages_subdomain
  type    = "CNAME"
  ttl     = 1
  proxied = true
}
