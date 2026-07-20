# GIT

- Never commit or push unless explicitly instructed to.

## Git Management

- `main` is protected by a Terraform-managed **repository ruleset** (`infrastructure/terraform/github.tf`), not classic branch protection. PRs are required; a direct push is rejected with `GH006: Changes must be made through a pull request`.
- The only bypass is repo admins (`RepositoryRole` 5), matching the old `enforce_admins = false`. There is no bypass for the GitHub Actions app or `GITHUB_TOKEN` — a bot identity can't hold a collaborator role, and this repo is user-owned, so GitHub also rejects `Integration` actors outright (they're only valid on org repos). The agent sandbox's GitHub App gets no bypass either — it goes through PRs.
- Because `GITHUB_TOKEN` has no bypass, workflows that push to `main` directly (the upptime crons) authenticate as a real admin PAT instead: `.github/actions/vault-secrets` imports `GITHUB_TOKEN` from Vault `kv/data/secrets`, so the push lands as `iamharryliu` and matches the `RepositoryRole` bypass.
- Change protection by editing `github.tf` and running `pnpm tf:apply`, never in the GitHub UI (see [CI.md](./CI.md)). A workflow that commits _conditionally_ can report success while blocked, so verify a bot commit actually lands rather than trusting a green run.
