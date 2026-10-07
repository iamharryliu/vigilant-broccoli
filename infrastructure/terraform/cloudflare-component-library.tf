# component-library.harryliu.dev — Cloudflare Pages site (project + deploys owned
# by the nx `component-library` deploy targets via wrangler). Points at the
# production-component-library project. Terraform owns the custom domain and its DNS.

resource "cloudflare_pages_domain" "component_library" {
  account_id   = var.cloudflare_account_id
  project_name = var.component_library_pages_project
  name         = var.component_library_domain
}

resource "cloudflare_dns_record" "component_library" {
  zone_id = var.cloudflare_zone_id
  name    = var.component_library_domain
  content = var.component_library_pages_subdomain
  type    = "CNAME"
  ttl     = 1
  proxied = true
}
