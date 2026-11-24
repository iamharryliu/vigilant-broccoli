import {
  to = github_repository.profile
  id = "iamharryliu"
}

# Only repository settings are managed; the README, branches and deploy key belong to deploy-github-profile.yml.
resource "github_repository" "profile" {
  name                   = var.github_owner
  description            = "GitHub profile README, generated and deployed by vigilant-broccoli."
  visibility             = "public"
  has_issues             = true
  has_projects           = true
  has_wiki               = true
  has_discussions        = false
  allow_merge_commit     = true
  delete_branch_on_merge = false
  archive_on_destroy     = true

  lifecycle {
    prevent_destroy = true
  }
}
