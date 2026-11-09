# cloud8skate.com — Cloudflare Pages site (project + deploys owned by the nx
# `cloud-8-skate-react` deploy target via wrangler). Terraform owns the custom
# domain attachment and its DNS. The zone predates Terraform, so first apply
# requires the domain to be free: remove the custom domain (and its apex CNAME,
# if Pages leaves one behind) from the old `cloud-8-skate-angular` project first.

data "cloudflare_zones" "cloud8skate" {
  name = var.cloud8skate_domain
}

resource "cloudflare_pages_domain" "cloud8skate" {
  account_id   = var.cloudflare_account_id
  project_name = var.cloud8skate_pages_project
  name         = var.cloud8skate_domain
}

resource "cloudflare_dns_record" "cloud8skate_apex" {
  zone_id = data.cloudflare_zones.cloud8skate.result[0].id
  name    = var.cloud8skate_domain
  content = var.cloud8skate_pages_subdomain
  type    = "CNAME"
  ttl     = 1
  proxied = true
}

# Staging lives in this zone, not harryliu.dev, so it is outside
# `staging_pages_domains`; its Access destination is added in
# cloudflare-staging-ui.tf.
locals {
  staging_cloud8skate_project = "staging-cloud-8-skate-react"
  staging_cloud8skate_domain  = "staging.${var.cloud8skate_domain}"
}

resource "cloudflare_pages_domain" "staging_cloud8skate" {
  account_id   = var.cloudflare_account_id
  project_name = local.staging_cloud8skate_project
  name         = local.staging_cloud8skate_domain
  depends_on   = [cloudflare_zero_trust_access_application.staging_pages]
}

resource "cloudflare_dns_record" "staging_cloud8skate" {
  zone_id    = data.cloudflare_zones.cloud8skate.result[0].id
  name       = local.staging_cloud8skate_domain
  content    = "${local.staging_cloud8skate_project}.pages.dev"
  type       = "CNAME"
  ttl        = 1
  proxied    = true
  depends_on = [cloudflare_zero_trust_access_application.staging_pages]
}
