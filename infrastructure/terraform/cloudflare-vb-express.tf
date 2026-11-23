# VB Express API hosts in the vigilant-broccoli.app zone, proxied to the fly
# apps. deploy.yml adds the matching fly certs so the origin TLS handshake
# succeeds. The old harryliu.dev hosts in cloudflare-harryliu-dev.tf stay until
# deployed clients have moved over.

resource "cloudflare_dns_record" "vb_express_api" {
  zone_id = data.cloudflare_zones.vigilant_broccoli.result[0].id
  name    = "api.${var.vigilant_broccoli_domain}"
  content = "production-vb-express.fly.dev"
  type    = "CNAME"
  ttl     = 1
  proxied = true
}

resource "cloudflare_dns_record" "vb_express_staging_api" {
  zone_id = data.cloudflare_zones.vigilant_broccoli.result[0].id
  name    = "staging-api.${var.vigilant_broccoli_domain}"
  content = "staging-vb-express.fly.dev"
  type    = "CNAME"
  ttl     = 1
  proxied = true
}

# Cloudflare's proxy hides the CNAME from Fly, so the cert only issues once
# these DNS-only records prove domain ownership; without them the origin TLS
# handshake fails with a 525. Values come from `flyctl certs show --json`
# (`0pqp2op` is the staging-vb-express app's validation id).
resource "cloudflare_dns_record" "vb_express_staging_api_acme_challenge" {
  zone_id = data.cloudflare_zones.vigilant_broccoli.result[0].id
  name    = "_acme-challenge.staging-api.${var.vigilant_broccoli_domain}"
  content = "staging-api.${var.vigilant_broccoli_domain}.0pqp2op.flydns.net"
  type    = "CNAME"
  ttl     = 1
  proxied = false
}

resource "cloudflare_dns_record" "vb_express_staging_api_fly_ownership" {
  zone_id = data.cloudflare_zones.vigilant_broccoli.result[0].id
  name    = "_fly-ownership.staging-api.${var.vigilant_broccoli_domain}"
  content = "\"app-0pqp2op\""
  type    = "TXT"
  ttl     = 1
  proxied = false
}
