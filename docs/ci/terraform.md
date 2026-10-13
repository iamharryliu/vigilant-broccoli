# Terraform

Where infrastructure-as-code lives, how it is applied, and how drift is detected.

- Infrastructure-as-code lives in `infrastructure/terraform/`, driven by the `pnpm tf:*` scripts — resource inventory and operations in [repo-operations.md](../repo-operations.md). Never change Terraform-managed provider config in a provider dashboard — the next apply reverts it.
- `cron-terraform-drift` runs `terraform plan -detailed-exitcode -lock=false` daily and fails when config, state, and the real infrastructure disagree — a dashboard edit, a merged-but-unapplied change, or a resource deleted out of band. Applies stay local (`pnpm tf:apply`); the workflow only reads. It authenticates to GCP as the read-only `github-actions-tf-drift` SA (`github-actions-tf-drift.tf`), whose WIF provider accepts only this workflow on `main`. The repo is public, so the plan body is never printed — the job summary lists changed addresses and actions only. When it goes red, run `pnpm tf:plan` locally for the full diff. A new Google resource type the SA can't read (a 403 during refresh) needs a read role added there, not a wider shared SA.
