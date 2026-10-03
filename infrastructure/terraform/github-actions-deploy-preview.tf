# Minimally-scoped GCP identity for deploy-preview.yml, which needs to reach
# Vault for the Cloudflare Pages deploy credentials. Deliberately separate from
# google_service_account.github_actions in main.tf: that SA carries
# roles/editor + secretmanager.secretAccessor (project-wide, everything except
# BITWARDEN_PASSWORD) + serviceAccountAdmin + workloadIdentityPoolAdmin +
# compute/IAP/osLogin, for deploy/rotate workflows running on main/production.
#
# deploy-preview.yml runs on a push to *any* branch and executes the workflow
# YAML from that branch, so — exactly like the pull_request case in
# github-actions-pr-check.tf — anyone who can push a branch could edit it to
# assume whatever identity it names and read the Vault root token straight out
# of Secret Manager, bypassing any Vault-side role/policy scoping. The shared
# 'github' provider's attribute_condition only refuses pull_request, so it
# would hand this workflow that broad SA; this one is pinned to the workflow
# file and can read nothing but the two Cloudflare Access secrets needed to
# reach the Vault tunnel.

resource "google_service_account" "github_actions_deploy_preview" {
  account_id   = "github-actions-deploy-preview"
  display_name = "GitHub Actions (branch previews)"
  description  = "Scoped to deploy-preview.yml via WIF job_workflow_ref; read-only on the two Cloudflare Access secrets, nothing else."
}

resource "google_iam_workload_identity_pool_provider" "github_deploy_preview" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_actions.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-deploy-preview"
  display_name                       = "GitHub provider (deploy-preview)"
  description                        = "Same OIDC issuer as the 'github' provider, but the attribute_condition also requires job_workflow_ref to be deploy-preview.yml, so only that workflow can present this identity."

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
    "attribute.aud"        = "assertion.aud"
  }

  # No @ref suffix, unlike the rotate/code-server Vault roles: previews exist
  # to run on branches, so the ref cannot be pinned. That is why the identity
  # this guards is worth nothing beyond the Vault tunnel credentials.
  attribute_condition = "assertion.repository == '${var.github_owner}/${var.github_repo}' && assertion.job_workflow_ref.startsWith('${var.github_owner}/${var.github_repo}/.github/workflows/deploy-preview.yml@')"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account_iam_member" "github_actions_deploy_preview_workload_identity" {
  service_account_id = google_service_account.github_actions_deploy_preview.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/projects/${data.google_project.project.number}/locations/global/workloadIdentityPools/${google_iam_workload_identity_pool.github_actions.workload_identity_pool_id}/attribute.repository/${var.github_owner}/${var.github_repo}"
}

resource "google_secret_manager_secret_iam_member" "github_actions_deploy_preview_cf_access_client_id" {
  secret_id = google_secret_manager_secret.vault_cf_access_client_id.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.github_actions_deploy_preview.email}"
}

resource "google_secret_manager_secret_iam_member" "github_actions_deploy_preview_cf_access_client_secret" {
  secret_id = google_secret_manager_secret.vault_cf_access_client_secret.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.github_actions_deploy_preview.email}"
}
