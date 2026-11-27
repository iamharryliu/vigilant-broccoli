# notepad.vigilant-broccoli.app — Cloudflare Pages site (project + deploys owned by the
# nx `notepad-react` deploy targets via wrangler). Points at the
# production-notepad-react project. Terraform owns the custom domain and its DNS.
# The vigilant-broccoli.app zone is a separate Cloudflare zone, looked up by name
# in cloudflare-vigilant-broccoli-app.tf.
resource "cloudflare_pages_domain" "notepad" {
  account_id   = var.cloudflare_account_id
  project_name = var.notepad_pages_project
  name         = local.vb_app_domains.notepad
}

resource "cloudflare_dns_record" "notepad" {
  zone_id = data.cloudflare_zones.vigilant_broccoli.result[0].id
  name    = local.vb_app_domains.notepad
  content = var.notepad_pages_subdomain
  type    = "CNAME"
  ttl     = 1
  proxied = true
}
