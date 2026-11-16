# Agent Context — .github

Read [workflow-conventions.md](../docs/ci/workflow-conventions.md) before workflow changes.

## Table of Contents

- [Nuances](#nuances)
  - [ci-pr-security-review must stay on `workflow_run` and never run PR code](#ci-pr-security-review-must-stay-on-workflow_run-and-never-run-pr-code)

## Nuances

### ci-pr-security-review must stay on `workflow_run` and never run PR code

`ci-pr-security-review.yml` reads `kv/data/secrets` through the main-bound `github-actions-role`, which is safe only because `workflow_run` executes the default branch's copy of the workflow (OIDC `ref` `refs/heads/main`). Switching it to `pull_request` would run the PR's own edited reviewer, and `pull_request_target` or a checkout of the PR head would put PR code next to `CLAUDE_CODE_OAUTH_TOKEN`. Keep the PR as API data (`gh api`), the checkout on `main` with `persist-credentials: false`, and Claude in the `env -i` allowlist in `.github/scripts/review-pr-security.sh`. Edits to the workflow itself only take effect after merging to `main`, so test changes with a follow-up PR. [Credentials](../docs/infrastructure/secret-management.md#pr-security-review-credentials).
