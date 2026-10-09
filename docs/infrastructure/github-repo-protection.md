# GitHub Repository Protection

How `main` and `production` are protected, which actors bypass them, and the traps that follow from that.

## Table of Contents

- [Ruleset and bypass actors](#ruleset-and-bypass-actors)
- [Production promotion](#production-promotion)
- [Operational traps](#operational-traps)

## Ruleset and bypass actors

- `main` is protected by a Terraform-managed **repository ruleset** (`infrastructure/terraform/github.tf`), not classic branch protection. PRs are required and, via the `update` rule, only bypass actors can move `main` at all — so a direct push is rejected with `GH006`/`GH013`, and a PR can only be merged by an admin, never by the agent-sandbox/code-server GitHub App even though it holds Contents write.
- Repo admins (`RepositoryRole` 5) are the sole bypass actor of `main`'s ruleset. `GITHUB_TOKEN` has no bypass. The agent-sandbox/code-server GitHub App has Contents, Pull requests, and Workflows write permission but must use PRs; only an admin can merge them. GitHub's Contents permission authorizes both branch pushes and PR merges, so the ruleset prevents that App from moving `main`.

Upptime executes in `iamharryliu/uptime` using that repository's temporary `GITHUB_TOKEN`. The separate configuration-sync App is installed only on the monitoring repository and never bypasses protection here. A stolen App private key can mint fresh installation tokens until revoked; token expiry only bounds theft of an individual token.

## Production promotion

`production` is only ever moved by `manual-promote-production.yml`, which fast-forwards it to the current `main` commit. Two Terraform-managed rulesets in `github.tf` cover the branch; they are separate because a bypass actor skips every rule in its ruleset.

| Ruleset                 | Rules                          | Bypass actors                               |
| ----------------------- | ------------------------------ | ------------------------------------------- |
| `production-protection` | `deletion`, `non_fast_forward` | None — the promotion App and admins obey it |
| `production-update`     | `update`                       | The `production-promotion` App (`always`)   |

`main`'s ruleset is unchanged: admins stay its bypass actor, and merge commits already in `main`'s history promote normally (fast-forward is about `production` being an ancestor of the pushed commit, not about linear history).

**Usage.** `pnpm gh:actions:promote-production` (or Actions → `manual-promote-production` → Run workflow on `main`). The job refuses to run from any other ref, fetches `main` and `production` explicitly, captures the `main` SHA once, fails unless `production` is its ancestor (divergence), exits green when they are already equal, then pushes that exact SHA to `refs/heads/production` without force using a one-hour installation token scoped to this repository with `contents: write`. Promotions are serialized by the `manual-promote-production` concurrency group (`cancel-in-progress: false`); a conflicting update that lands in between is rejected by the non-force push, so rerun after checking the new state. Because the push is made with an App token rather than `GITHUB_TOKEN`, it triggers the `push: production` runs of `deploy`, `deploy-docs-md` and `deploy-context-md` (still subject to their `paths` filters, so a promotion touching none of those paths deploys nothing).

**The App.** A dedicated private GitHub App, `production-promotion`, webhooks inactive, installed only on `iamharryliu/vigilant-broccoli`, with repository permission **Contents: read and write** (Metadata read is implicit). It is not the agent-sandbox/code-server App and that App gets no production bypass. If a promotion that includes `.github/workflows/**` changes is rejected for lacking `workflows` permission, add Workflows write to the App and accept the new permission request on the installation.

**Rollout order.** Nothing here has been applied; do it in this order:

1. Register and install the App as above; note its numeric App ID and generate a private key.
2. Store the key: `base64 -i key.pem | tr -d '\n'`, then `vault kv put kv/production-promotion PRODUCTION_PROMOTION_GH_APP_PRIVATE_KEY=<b64>` (same procedure as in [secret-rotation-implementation.md](./secret-rotation-implementation.md)); refresh the Bitwarden backup.
3. Run `pnpm gcp:vm:post-init` to create `github-actions-production-promotion-role`/`-policy` (bound to this workflow file on `main`, reading only `kv/data/production-promotion`).
4. Set `production_promotion_gh_app_id` in `infrastructure/terraform/variables.tf`, then locally `pnpm tf:plan` and `pnpm tf:apply` (applies stay local — see [terraform.md](../ci/terraform.md)). This creates the dedicated GCP identity and WIF provider, the `PRODUCTION_PROMOTION_*` Actions variables (variables, not secrets), splits the old `production` ruleset into the two above (a `moved` block renames it, dropping its admin bypass) and activates `production-update`. Until the App ID is non-zero, `production-update` is `disabled` and the workflow job is skipped, but `production-protection` is already enforced: nobody can force-push or delete `production`.
5. Merge the workflow to `main`, then run it once and confirm the deploy runs on `production` start.

**Credential rotation.** Generate a new key on the App, `vault kv put` it to `kv/production-promotion` as above, run the workflow once to confirm, then delete the old key in the App settings. A leaked key can mint tokens until revoked, and those tokens can update `production` (not delete or rewind it); revoke the key first, then inspect `production` history.

**Enforcement limits.**

- Rulesets cannot restrict which branch a push to `production` comes from. The App bypass allows any `contents: write` push, so "only from `main`" is enforced by the workflow, and the trust boundary is the App's private key: only the workflow file at `@refs/heads/main` can mint the Vault/GCP identities that read it.
- Fast-forward-only is enforced by the ruleset (no bypass); fast-forward-from-`main` is enforced by the workflow.
- Admins can still edit or delete the rulesets (and the App's bypass) in the GitHub UI or via Terraform, and then push. Drift shows up in `cron-terraform-drift`.
- Promotion is not the only way to deploy production. Other entry points deploy the `production` environment from whatever ref is dispatched, with no ancestry check: `deploy` (`workflow_dispatch` input `environment: production`), `manual-deploy-app` (`environment: production`), `deploy-docs-md` and `deploy-context-md` (their `environment` input), and `ci-rotate-secrets`, which calls `deploy` for production on purpose. Whoever can dispatch workflows (admins; the agent-sandbox App has no `actions` write) can therefore deploy production without moving the `production` branch. Vault's `github-actions-role` is bound to `refs/heads/main` and `refs/heads/production`, so a dispatch from another branch fails to read secrets, but a dispatch from `main` succeeds.

## Operational traps

- Change protection by editing `github.tf` and running `pnpm tf:apply`, never in the GitHub UI (see [terraform.md](../ci/terraform.md)). A workflow that commits _conditionally_ can report success while blocked, so verify a bot commit actually lands rather than trusting a green run.
- `google-github-actions/auth` writes a `gha-creds-*.json` file into the job's working directory. It's gitignored, but any tool that does a blanket `git add .` (e.g. Upptime's commit step) will happily stage it if it isn't. Check `.gitignore` covers this before adding any workflow that both authenticates via WIF and auto-commits.
