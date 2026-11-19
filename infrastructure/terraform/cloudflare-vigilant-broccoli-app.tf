# Public tool sites (Cloudflare Pages, plus the GitHub Pages projects index) hosted in the vigilant-broccoli.app zone. Each per-site
# cloudflare-<site>.tf reads its hostname from here, so moving the sites to another
# zone is one change to `vigilant_broccoli_domain`. The zone is a separate Cloudflare
# zone, looked up by name, and must exist in the account before the first apply.
data "cloudflare_zones" "vigilant_broccoli" {
  name = var.vigilant_broccoli_domain
}

locals {
  vb_app_domains = {
    bookmarks         = "bookmarks.${var.vigilant_broccoli_domain}"
    component_library = "components.${var.vigilant_broccoli_domain}"
    context           = "context.${var.vigilant_broccoli_domain}"
    grind_75          = "grind-75.${var.vigilant_broccoli_domain}"
    pomodoro          = "pomodoro.${var.vigilant_broccoli_domain}"
    projects          = "projects.${var.vigilant_broccoli_domain}"
    text_tools        = "text-tools.${var.vigilant_broccoli_domain}"
    utilities         = "utilities.${var.vigilant_broccoli_domain}"
    waiting           = "waiting.${var.vigilant_broccoli_domain}"
  }
}
