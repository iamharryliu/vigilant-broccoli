resource "github_repository" "upptime" {
  name                   = var.upptime_repo
  description            = "Public uptime checks and incident history; managed by vigilant-broccoli."
  visibility             = "public"
  has_issues             = true
  has_wiki               = false
  has_projects           = false
  has_discussions        = false
  auto_init              = true
  archive_on_destroy     = true
  allow_auto_merge       = false
  delete_branch_on_merge = true
}

data "github_repository" "upptime_bootstrap" {
  full_name = github_repository.upptime.full_name
}

resource "github_branch" "upptime_main" {
  repository    = github_repository.upptime.name
  branch        = "main"
  source_branch = data.github_repository.upptime_bootstrap.default_branch

  # Changing the default branch after bootstrap must not recreate main.
  lifecycle {
    ignore_changes = [source_branch]
  }
}

resource "github_branch" "upptime_pages" {
  repository    = github_repository.upptime.name
  branch        = "gh-pages"
  source_branch = github_branch.upptime_main.branch

  # The site workflow force-publishes this branch; later source changes must not recreate it.
  lifecycle {
    ignore_changes = [source_branch]
  }
}

resource "github_branch_default" "upptime" {
  repository = github_repository.upptime.name
  branch     = github_branch.upptime_main.branch
}

resource "github_actions_repository_permissions" "upptime" {
  repository      = github_repository.upptime.name
  allowed_actions = "selected"

  allowed_actions_config {
    github_owned_allowed = false
    verified_allowed     = false
    patterns_allowed = [
      "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1",
      "actions/setup-node@820762786026740c76f36085b0efc47a31fe5020",
      "upptime/uptime-monitor@8be193bbcb957a3a917d2bb16a0c96959778a889",
    ]
  }
}

resource "github_workflow_repository_permissions" "upptime" {
  repository                       = github_repository.upptime.name
  default_workflow_permissions     = "read"
  can_approve_pull_request_reviews = false
}

locals {
  upptime_sync_variables = {
    UPPTIME_REPOSITORY           = "${var.github_owner}/${github_repository.upptime.name}"
    UPPTIME_SYNC_APP_ID          = tostring(var.upptime_sync_gh_app_id)
    UPPTIME_SYNC_ENABLED         = tostring(var.upptime_sync_gh_app_id > 0)
    UPPTIME_SYNC_WIF_PROVIDER    = google_iam_workload_identity_pool_provider.github_upptime_sync.name
    UPPTIME_SYNC_SERVICE_ACCOUNT = google_service_account.github_actions_upptime_sync.email
  }
}

resource "github_actions_variable" "upptime_sync" {
  for_each      = local.upptime_sync_variables
  repository    = github_repository.vigilant_broccoli.name
  variable_name = each.key
  value         = each.value
}

resource "github_actions_variable" "upptime_monitoring_enabled" {
  repository    = github_repository.upptime.name
  variable_name = "UPPTIME_MONITORING_ENABLED"
  value         = tostring(var.upptime_migration_complete)
}

resource "github_repository_pages" "upptime" {
  repository = github_repository.upptime.name
  build_type = "legacy"
  cname      = cloudflare_dns_record.harryliu_dev_uptime.name

  https_enforced = var.upptime_https_enforced

  source {
    branch = github_branch.upptime_pages.branch
    path   = "/"
  }
}
