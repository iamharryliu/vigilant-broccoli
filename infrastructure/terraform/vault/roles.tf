locals {
  workflow_ref_prefix = "${var.github_repository}/.github/workflows"

  # Keyed by role name. Every role accepts GitHub Actions OIDC tokens for this
  # repository only; bound_claims narrows which workflow or ref may log in.
  jwt_roles = {
    # ref is bound alongside repository: without it any job in the repo,
    # including a pull_request run of a branch-edited workflow, could read
    # every deploy secret. workflow_dispatch runs must be dispatched on main.
    "github-actions-role" = {
      policy       = "github-actions-policy"
      bound_claims = { ref = "refs/heads/main" }
    }
    "github-actions-rotate-role" = {
      policy       = "github-actions-rotate-policy"
      bound_claims = { job_workflow_ref = "${local.workflow_ref_prefix}/ci-rotate-secrets.yml@refs/heads/main" }
    }
    # job_workflow_ref cannot carry an @refs/heads/main suffix here: the
    # workflow runs from the PR branch, so its policy is scoped instead.
    "github-actions-pr-check-role" = {
      policy       = "github-actions-pr-check-policy"
      bound_claims = { job_workflow_ref = "${local.workflow_ref_prefix}/ci-pr-check.yml@*" }
    }
    # Same as pr-check: deploy-preview.yml runs from any pushed branch.
    "github-actions-deploy-preview-role" = {
      policy       = "github-actions-deploy-preview-policy"
      bound_claims = { job_workflow_ref = "${local.workflow_ref_prefix}/deploy-preview.yml@*" }
    }
    "github-actions-upptime-sync-role" = {
      policy            = "github-actions-upptime-sync-policy"
      bound_claims_type = "string"
      ttl               = 600
      bound_claims      = { job_workflow_ref = "${local.workflow_ref_prefix}/ci-sync-upptime.yml@refs/heads/main" }
    }
    "github-actions-code-server-role" = {
      policy       = "github-actions-code-server-policy"
      bound_claims = { job_workflow_ref = "${local.workflow_ref_prefix}/manual-replace-code-server.yml@refs/heads/main" }
    }
  }
}

resource "vault_jwt_auth_backend_role" "github_actions" {
  for_each = local.jwt_roles

  backend           = var.jwt_backend
  role_name         = each.key
  role_type         = "jwt"
  user_claim        = "actor"
  bound_claims_type = lookup(each.value, "bound_claims_type", "glob")
  bound_claims      = merge({ repository = var.github_repository }, each.value.bound_claims)
  bound_audiences   = ["https://github.com/${var.github_repository}"]
  token_policies    = [vault_policy.github_actions[each.value.policy].name]
  token_ttl         = lookup(each.value, "ttl", 1800)
}
