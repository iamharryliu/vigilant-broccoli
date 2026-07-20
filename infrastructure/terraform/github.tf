resource "github_repository" "vigilant_broccoli" {
  name         = var.github_repo
  description  = "idek"
  homepage_url = "https://iamharryliu.github.io/vigilant-broccoli/"
  visibility   = "public"

  has_issues      = true
  has_projects    = true
  has_wiki        = false
  has_discussions = false

  allow_merge_commit     = true
  allow_squash_merge     = true
  allow_rebase_merge     = true
  allow_auto_merge       = false
  delete_branch_on_merge = true

  auto_init                   = false
  archive_on_destroy          = true
  squash_merge_commit_title   = "COMMIT_OR_PR_TITLE"
  squash_merge_commit_message = "COMMIT_MESSAGES"
}

resource "github_repository_vulnerability_alerts" "vigilant_broccoli" {
  repository = github_repository.vigilant_broccoli.name
}

resource "github_branch" "main" {
  repository = github_repository.vigilant_broccoli.name
  branch     = "main"
}

resource "github_branch_default" "default" {
  repository = github_repository.vigilant_broccoli.name
  branch     = github_branch.main.branch
}

resource "github_actions_secret" "gcp_service_account" {
  repository  = github_repository.vigilant_broccoli.name
  secret_name = "GCP_SERVICE_ACCOUNT"
  value       = google_service_account.github_actions.email
}

resource "github_actions_secret" "gcp_workload_identity_provider" {
  repository  = github_repository.vigilant_broccoli.name
  secret_name = "GCP_WORKLOAD_IDENTITY_PROVIDER"
  value       = google_iam_workload_identity_pool_provider.github.name
}

locals {
  ruleset_bypass_github_actions  = 15368
  ruleset_bypass_repository_role = 5
}

resource "github_repository_ruleset" "main" {
  name        = "main"
  repository  = github_repository.vigilant_broccoli.name
  target      = "branch"
  enforcement = "active"

  conditions {
    ref_name {
      include = ["~DEFAULT_BRANCH"]
      exclude = []
    }
  }

  # A ruleset is used over github_branch_protection because classic protection
  # can only exempt repo admins: the Actions bot has no bypass there, so the
  # upptime crons could not push their status commits. The agent sandbox's
  # GitHub App is deliberately left out of bypass_actors — it goes through PRs.
  bypass_actors {
    actor_id    = local.ruleset_bypass_github_actions
    actor_type  = "Integration"
    bypass_mode = "always"
  }

  bypass_actors {
    actor_id    = local.ruleset_bypass_repository_role
    actor_type  = "RepositoryRole"
    bypass_mode = "always"
  }

  rules {
    deletion         = true
    non_fast_forward = true

    pull_request {
      required_approving_review_count = 0
    }
  }
}
