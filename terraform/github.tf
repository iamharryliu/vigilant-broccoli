resource "github_repository" "vigilant_broccoli" {
  name        = var.github_repo
  description = "Personal monorepo for projects and utilities"
  visibility  = "public"

  has_issues      = true
  has_projects    = true
  has_wiki        = false
  has_discussions = false

  allow_merge_commit     = true
  allow_squash_merge     = true
  allow_rebase_merge     = true
  allow_auto_merge       = false
  delete_branch_on_merge = true

  auto_init              = false
  archive_on_destroy     = true
  vulnerability_alerts   = true
  squash_merge_commit_title   = "COMMIT_OR_PR_TITLE"
  squash_merge_commit_message = "COMMIT_MESSAGES"
}

resource "github_branch" "main" {
  repository = github_repository.vigilant_broccoli.name
  branch     = "main"
}

resource "github_branch_default" "default" {
  repository = github_repository.vigilant_broccoli.name
  branch     = github_branch.main.branch
}

resource "github_branch_protection" "main" {
  repository_id = github_repository.vigilant_broccoli.node_id
  pattern       = "main"

  enforce_admins                  = false
  allows_force_pushes             = false
  allows_deletions                = false
  require_signed_commits          = false
  required_linear_history         = false
  require_conversation_resolution = false

  force_push_bypassers = [
    "/iamharryliu"
  ]

  required_pull_request_reviews {
    dismiss_stale_reviews           = true
    require_code_owner_reviews      = false
    required_approving_review_count = 0
  }

  required_status_checks {
    strict   = false
    contexts = []
  }
}
