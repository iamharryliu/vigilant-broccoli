resource "github_repository" "vigilant_broccoli" {
  name         = var.github_repo
  description  = "idek"
  homepage_url = "https://projects.harryliu.dev/"
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

resource "github_branch" "production" {
  repository = github_repository.vigilant_broccoli.name
  branch     = "production"
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

  bypass_actors {
    actor_id    = local.ruleset_bypass_repository_role
    actor_type  = "RepositoryRole"
    bypass_mode = "always"
  }

  # `update` restricts every ref update on main -- including merging a PR --
  # to the bypass actors above. Without it the agent-sandbox/code-server App
  # (Contents RW, which is also the permission that merges PRs) could push a
  # branch, open a PR and merge it itself; there are no required reviews or
  # status checks to slow that down. The App has no bypass, so it can only ever
  # get as far as an open PR. You merge as admin, which bypasses the rule.
  rules {
    deletion         = true
    non_fast_forward = true
    update           = true

    pull_request {
      required_approving_review_count = 0
    }
  }
}

locals {
  production_promotion_variables = {
    PRODUCTION_PROMOTION_APP_ID          = tostring(var.production_promotion_gh_app_id)
    PRODUCTION_PROMOTION_ENABLED         = tostring(var.production_promotion_gh_app_id > 0)
    PRODUCTION_PROMOTION_WIF_PROVIDER    = google_iam_workload_identity_pool_provider.github_production_promotion.name
    PRODUCTION_PROMOTION_SERVICE_ACCOUNT = google_service_account.github_actions_production_promotion.email
  }
}

resource "github_actions_variable" "production_promotion" {
  for_each      = local.production_promotion_variables
  repository    = github_repository.vigilant_broccoli.name
  variable_name = each.key
  value         = each.value
}

# Deletion and force-pushes are blocked for everyone, the promotion App
# included: no bypass actors, so neither an admin nor the App can rewrite or
# remove production. Kept apart from the update ruleset below because a bypass
# actor on a ruleset skips every rule in it.
resource "github_repository_ruleset" "production_protection" {
  name        = "production-protection"
  repository  = github_repository.vigilant_broccoli.name
  target      = "branch"
  enforcement = "active"

  conditions {
    ref_name {
      include = ["refs/heads/production"]
      exclude = []
    }
  }

  rules {
    deletion         = true
    non_fast_forward = true
  }
}

# `update` restricts every push to production to the dedicated promotion App.
# Rulesets cannot restrict which branch a push comes from, so the fast-forward
# from main is enforced by manual-promote-production.yml, whose App key only
# that workflow on main can read. Disabled until the App ID is configured.
resource "github_repository_ruleset" "production_update" {
  name        = "production-update"
  repository  = github_repository.vigilant_broccoli.name
  target      = "branch"
  enforcement = var.production_promotion_gh_app_id > 0 ? "active" : "disabled"

  conditions {
    ref_name {
      include = ["refs/heads/production"]
      exclude = []
    }
  }

  dynamic "bypass_actors" {
    for_each = var.production_promotion_gh_app_id > 0 ? [var.production_promotion_gh_app_id] : []
    content {
      actor_id    = bypass_actors.value
      actor_type  = "Integration"
      bypass_mode = "always"
    }
  }

  rules {
    update = true
  }
}

moved {
  from = github_repository_ruleset.production
  to   = github_repository_ruleset.production_protection
}

import {
  to = github_repository_pages.vigilant_broccoli
  id = var.github_repo
}

resource "github_repository_pages" "vigilant_broccoli" {
  repository = github_repository.vigilant_broccoli.name
  build_type = "workflow"
  cname      = cloudflare_dns_record.harryliu_dev_projects.name
}
