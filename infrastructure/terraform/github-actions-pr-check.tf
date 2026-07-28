# Minimally-scoped GCP identity for pull_request-triggered workflows
# (currently just ci-pr-check.yml, which needs to reach Vault for the
# read-only nx-cache token). Deliberately separate from
# google_service_account.github_actions in main.tf: that SA carries
# roles/editor + secretmanager.secretAccessor (project-wide, everything
# except BITWARDEN_PASSWORD) + serviceAccountAdmin + workloadIdentityPoolAdmin
# + compute/IAP/osLogin, for push-triggered deploy/rotate workflows.
#
# pull_request (unlike pull_request_target) executes the workflow YAML from
# the PR branch itself, so any contributor who gets a PR check to run could
# edit ci-pr-check.yml to assume that broad SA and read the Vault root token
# straight out of Secret Manager — which would bypass any amount of Vault-side
# role/policy scoping entirely. This SA can only ever read the two Cloudflare
# Access secrets needed to reach the Vault tunnel, nothing else, so there's
# nothing worth exfiltrating even if a malicious PR assumes it.

resource "google_service_account" "github_actions_pr_check" {
  account_id   = "github-actions-pr-check"
  display_name = "GitHub Actions (pull_request checks)"
  description  = "Scoped to ci-pr-check.yml via WIF job_workflow_ref; read-only on the two Cloudflare Access secrets, nothing else."
}

resource "google_iam_workload_identity_pool_provider" "github_pr_check" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_actions.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-pr-check"
  display_name                       = "GitHub provider (ci-pr-check)"
  description                        = "Same OIDC issuer as the 'github' provider, but the attribute_condition also requires job_workflow_ref to be ci-pr-check.yml, so only that workflow can present this identity."

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
    "attribute.aud"        = "assertion.aud"
  }

  attribute_condition = "assertion.repository == '${var.github_owner}/${var.github_repo}' && assertion.job_workflow_ref.startsWith('${var.github_owner}/${var.github_repo}/.github/workflows/ci-pr-check.yml@')"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account_iam_member" "github_actions_pr_check_workload_identity" {
  service_account_id = google_service_account.github_actions_pr_check.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/projects/${data.google_project.project.number}/locations/global/workloadIdentityPools/${google_iam_workload_identity_pool.github_actions.workload_identity_pool_id}/attribute.repository/${var.github_owner}/${var.github_repo}"
}

resource "google_secret_manager_secret_iam_member" "github_actions_pr_check_cf_access_client_id" {
  secret_id = google_secret_manager_secret.vault_cf_access_client_id.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.github_actions_pr_check.email}"
}

resource "google_secret_manager_secret_iam_member" "github_actions_pr_check_cf_access_client_secret" {
  secret_id = google_secret_manager_secret.vault_cf_access_client_secret.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.github_actions_pr_check.email}"
}
