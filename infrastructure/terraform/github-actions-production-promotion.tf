resource "google_service_account" "github_actions_production_promotion" {
  account_id   = "github-actions-prod-promotion"
  display_name = "GitHub Actions (production promotion)"
  description  = "Only reads Cloudflare Access credentials for the workflow-bound production promotion Vault role."
}

resource "google_iam_workload_identity_pool_provider" "github_production_promotion" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_actions.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-production-promotion"
  display_name                       = "GitHub provider (production promotion)"

  # Mapping attribute.repository would also match the shared service account's
  # repository-wide pool binding, exposing its broader permissions.
  attribute_mapping = {
    "google.subject"         = "assertion.sub"
    "attribute.workflow_ref" = "assertion.workflow_ref"
  }

  attribute_condition = "assertion.repository == '${var.github_owner}/${var.github_repo}' && assertion.workflow_ref == '${var.github_owner}/${var.github_repo}/.github/workflows/manual-promote-production.yml@refs/heads/main' && assertion.ref == 'refs/heads/main' && assertion.event_name == 'workflow_dispatch'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account_iam_member" "github_actions_production_promotion_workload_identity" {
  service_account_id = google_service_account.github_actions_production_promotion.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/projects/${data.google_project.project.number}/locations/global/workloadIdentityPools/${google_iam_workload_identity_pool.github_actions.workload_identity_pool_id}/attribute.workflow_ref/${var.github_owner}/${var.github_repo}/.github/workflows/manual-promote-production.yml@refs/heads/main"
}

resource "google_secret_manager_secret_iam_member" "github_actions_production_promotion_cf_access" {
  for_each = {
    client_id     = google_secret_manager_secret.vault_cf_access_client_id.id
    client_secret = google_secret_manager_secret.vault_cf_access_client_secret.id
  }

  secret_id = each.value
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.github_actions_production_promotion.email}"
}
