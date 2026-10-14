# Cloudflare Pages domain attachment for todo.harryliu.dev

resource "cloudflare_pages_project" "todo" {
  account_id = var.cloudflare_account_id
  name       = "production-todo"
  subdomain  = "todo"
  production_branch = "production"
}

resource "cloudflare_pages_domain" "todo_harryliu_dev" {
  account_id = var.cloudflare_account_id
  project_name = cloudflare_pages_project.todo.name
  domain     = "todo.harryliu.dev"
}
