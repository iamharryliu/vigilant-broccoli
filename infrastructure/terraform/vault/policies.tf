locals {
  # Keyed by policy name. Bodies match what run-vault-post-init.sh writes, byte
  # for byte, so the imported policies plan with no changes.
  policies = {
    "github-actions-policy" = <<-EOT
      path "${var.kv_path}/data/secrets" {
        capabilities = ["read"]
      }
      path "${var.kv_path}/data/secrets/*" {
        capabilities = ["read"]
      }
      path "${var.kv_path}/data/test" {
        capabilities = ["read"]
      }
    EOT

    "github-actions-rotate-policy" = <<-EOT
      path "${var.kv_path}/data/secrets" {
        capabilities = ["read", "update", "patch"]
      }
      path "${var.kv_path}/data/test" {
        capabilities = ["read"]
      }
    EOT

    # ci-pr-check.yml is pull_request-triggered, so its identity is reachable by
    # anyone who gets a PR check to run: one path holding exactly one
    # low-privilege, easily-rotated key, never kv/data/secrets.
    "github-actions-pr-check-policy" = <<-EOT
      path "${var.kv_path}/data/ci-pr-check" {
        capabilities = ["read"]
      }
    EOT

    # deploy-preview.yml runs the workflow YAML of any pushed branch: its own
    # path holding only the two Cloudflare Pages deploy credentials, mirrored
    # from kv/data/secrets by tf:post-apply.
    "github-actions-deploy-preview-policy" = <<-EOT
      path "${var.kv_path}/data/deploy-preview" {
        capabilities = ["read"]
      }
    EOT

    "github-actions-upptime-sync-policy" = <<-EOT
      path "${var.kv_path}/data/upptime-sync" {
        capabilities = ["read"]
      }
    EOT

    # manual-replace-code-server.yml re-syncs CODE_SERVER_VM_IP after replacing
    # the code-server VM. Patch-only: it can merge one key into kv/data/secrets
    # but cannot read any secret.
    "github-actions-code-server-policy" = <<-EOT
      path "${var.kv_path}/data/secrets" {
        capabilities = ["patch"]
      }
    EOT

    # Read-only view of the policies and JWT roles this module manages, for
    # cron-terraform-drift's plan of this workspace. Both policy read paths are
    # granted because the provider's API client has used each.
    "github-actions-tf-drift-policy" = <<-EOT
      path "sys/policies/acl/*" {
        capabilities = ["read"]
      }
      path "sys/policy/*" {
        capabilities = ["read"]
      }
      path "auth/${var.jwt_backend}/role/*" {
        capabilities = ["read"]
      }
    EOT
  }
}

resource "vault_policy" "github_actions" {
  for_each = local.policies

  name   = each.key
  policy = each.value
}
