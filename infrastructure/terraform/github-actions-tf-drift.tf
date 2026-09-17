# Read-only GCP identity for cron-terraform-drift.yml, which runs
# `terraform plan` to catch drift between config, state, and the real world.
# google_service_account.github_actions in main.tf can't do this: it has no
# project-level read, so refreshing IAM bindings, WIF providers, KMS keys, or
# service accounts 403s. Rather than widen that SA (every push/dispatch
# workflow can assume it), this one carries viewer + securityReviewer and is
# only presentable through a provider whose attribute_condition pins
# job_workflow_ref to the drift workflow on main.
#
# Secret payloads are the one read beyond metadata: refreshing a
# google_secret_manager_secret_version reads its value. Access is granted only
# on the secrets whose versions Terraform itself writes (so those values
# already sit in Terraform Cloud state, which this workflow reads anyway via
# TF_CLOUD_TOKEN). Tier 0 secrets that Terraform only creates as empty
# containers (VB_VM_VAULT_ROOT_TOKEN, VB_VM_VAULT_UNSEAL_KEYS,
# BITWARDEN_PASSWORD, VB_VM_WG_SERVER_PRIVATE_KEY) are not granted.

locals {
  tf_drift_readable_secret_ids = {
    cloudflared_tunnel_token       = google_secret_manager_secret.cloudflared_tunnel_token.id
    vault_cf_access_client_id      = google_secret_manager_secret.vault_cf_access_client_id.id
    vault_cf_access_client_secret  = google_secret_manager_secret.vault_cf_access_client_secret.id
    wg_elva11_mbp_public_key       = google_secret_manager_secret.wg_elva11_mbp_public_key.id
    wg_personal_mbp_public_key     = google_secret_manager_secret.wg_personal_mbp_public_key.id
    google_gcs_sa_credentials      = google_secret_manager_secret.google_gcs_sa_credentials.id
    google_calendar_sa_credentials = google_secret_manager_secret.google_calendar_sa_credentials.id
  }
}

resource "google_service_account" "github_actions_tf_drift" {
  account_id   = "github-actions-tf-drift"
  display_name = "GitHub Actions (Terraform drift detection)"
  description  = "Scoped to cron-terraform-drift.yml on main via WIF job_workflow_ref; project read-only plus the Terraform-written secret versions."
}

resource "google_iam_workload_identity_pool_provider" "github_tf_drift" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_actions.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-tf-drift"
  display_name                       = "GitHub provider (tf drift)"
  description                        = "Same OIDC issuer as the 'github' provider, but the attribute_condition requires job_workflow_ref to be cron-terraform-drift.yml on main."

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
    "attribute.aud"        = "assertion.aud"
  }

  attribute_condition = "assertion.repository == '${var.github_owner}/${var.github_repo}' && assertion.job_workflow_ref == '${var.github_owner}/${var.github_repo}/.github/workflows/cron-terraform-drift.yml@refs/heads/main'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account_iam_member" "github_actions_tf_drift_workload_identity" {
  service_account_id = google_service_account.github_actions_tf_drift.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/projects/${data.google_project.project.number}/locations/global/workloadIdentityPools/${google_iam_workload_identity_pool.github_actions.workload_identity_pool_id}/attribute.repository/${var.github_owner}/${var.github_repo}"
}

resource "google_project_iam_member" "github_actions_tf_drift_project_read" {
  for_each = toset(["roles/viewer", "roles/iam.securityReviewer"])

  project = data.google_project.project.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.github_actions_tf_drift.email}"
}

resource "google_secret_manager_secret_iam_member" "github_actions_tf_drift_secret_accessor" {
  for_each = local.tf_drift_readable_secret_ids

  secret_id = each.value
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.github_actions_tf_drift.email}"
}
