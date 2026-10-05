resource "google_service_account" "github_actions_upptime_sync" {
  account_id   = "github-actions-upptime-sync"
  display_name = "GitHub Actions (Upptime configuration sync)"
  description  = "Only reads Cloudflare Access credentials for the workflow-bound Upptime sync Vault role."
}

resource "google_iam_workload_identity_pool_provider" "github_upptime_sync" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_actions.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-upptime-sync"
  display_name                       = "GitHub provider (Upptime sync)"

  # Mapping attribute.repository would also match the shared service account's
  # repository-wide pool binding, exposing its broader permissions.
  attribute_mapping = {
    "google.subject"             = "assertion.sub"
    "attribute.job_workflow_ref" = "assertion.job_workflow_ref"
  }

  attribute_condition = "assertion.repository == '${var.github_owner}/${var.github_repo}' && assertion.job_workflow_ref == '${var.github_owner}/${var.github_repo}/.github/workflows/ci-sync-upptime.yml@refs/heads/main' && assertion.event_name != 'pull_request'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account_iam_member" "github_actions_upptime_sync_workload_identity" {
  service_account_id = google_service_account.github_actions_upptime_sync.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/projects/${data.google_project.project.number}/locations/global/workloadIdentityPools/${google_iam_workload_identity_pool.github_actions.workload_identity_pool_id}/attribute.job_workflow_ref/${var.github_owner}/${var.github_repo}/.github/workflows/ci-sync-upptime.yml@refs/heads/main"
}

resource "google_secret_manager_secret_iam_member" "github_actions_upptime_sync_cf_access" {
  for_each = {
    client_id     = google_secret_manager_secret.vault_cf_access_client_id.id
    client_secret = google_secret_manager_secret.vault_cf_access_client_secret.id
  }

  secret_id = each.value
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.github_actions_upptime_sync.email}"
}
