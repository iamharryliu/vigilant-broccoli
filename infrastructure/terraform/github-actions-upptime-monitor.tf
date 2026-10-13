locals {
  upptime_monitor_workflows       = toset(["cron-upptime.yml", "cron-upptime-response-time.yml"])
  staging_ui_monitor_secret_names = toset(["STAGING_UI_CF_ACCESS_CLIENT_ID", "STAGING_UI_CF_ACCESS_CLIENT_SECRET"])
  staging_ui_monitor_credentials = {
    STAGING_UI_CF_ACCESS_CLIENT_ID     = cloudflare_zero_trust_access_service_token.staging_ui_monitor.client_id
    STAGING_UI_CF_ACCESS_CLIENT_SECRET = cloudflare_zero_trust_access_service_token.staging_ui_monitor.client_secret
  }
}

resource "google_service_account" "github_actions_upptime_monitor" {
  account_id   = "github-actions-upptime-monitor"
  display_name = "GitHub Actions (staging UI monitoring)"
  description  = "Reads only the staging UI Access service token; no Vault or application credentials."
}

resource "google_iam_workload_identity_pool_provider" "github_upptime_monitor" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_actions.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-upptime-monitor"
  display_name                       = "GitHub provider (staging UI monitoring)"

  # Do not map repository: that would also match the broad source-repo SA binding.
  attribute_mapping = {
    "google.subject"             = "assertion.sub"
    "attribute.job_workflow_ref" = "assertion.job_workflow_ref"
  }
  attribute_condition = "assertion.repository == '${var.github_owner}/${github_repository.upptime.name}' && assertion.ref == 'refs/heads/main' && assertion.event_name != 'pull_request' && assertion.job_workflow_ref in ${jsonencode([for workflow in sort(tolist(local.upptime_monitor_workflows)) : "${var.github_owner}/${github_repository.upptime.name}/.github/workflows/${workflow}@refs/heads/main"])}"
  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account_iam_member" "github_actions_upptime_monitor_identity" {
  for_each           = local.upptime_monitor_workflows
  service_account_id = google_service_account.github_actions_upptime_monitor.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/projects/${data.google_project.project.number}/locations/global/workloadIdentityPools/${google_iam_workload_identity_pool.github_actions.workload_identity_pool_id}/attribute.job_workflow_ref/${var.github_owner}/${github_repository.upptime.name}/.github/workflows/${each.value}@refs/heads/main"
}

resource "google_secret_manager_secret" "staging_ui_monitor" {
  for_each  = local.staging_ui_monitor_secret_names
  secret_id = each.key
  replication {
    auto {}
  }
  depends_on = [google_project_service.secretmanager]
}

resource "google_secret_manager_secret_version" "staging_ui_monitor" {
  for_each    = local.staging_ui_monitor_secret_names
  secret      = google_secret_manager_secret.staging_ui_monitor[each.key].id
  secret_data = local.staging_ui_monitor_credentials[each.key]
}

resource "google_secret_manager_secret_iam_member" "staging_ui_monitor" {
  for_each  = google_secret_manager_secret.staging_ui_monitor
  secret_id = each.value.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.github_actions_upptime_monitor.email}"
}

resource "github_actions_variable" "upptime_monitor_provider" {
  repository    = github_repository.upptime.name
  variable_name = "STAGING_UI_MONITOR_WIF_PROVIDER"
  value         = google_iam_workload_identity_pool_provider.github_upptime_monitor.name
}

resource "github_actions_variable" "upptime_monitor_service_account" {
  repository    = github_repository.upptime.name
  variable_name = "STAGING_UI_MONITOR_SERVICE_ACCOUNT"
  value         = google_service_account.github_actions_upptime_monitor.email
}

resource "google_secret_manager_secret_iam_member" "staging_ui_health_check" {
  for_each  = google_secret_manager_secret.staging_ui_monitor
  secret_id = each.value.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.github_actions.email}"
}
