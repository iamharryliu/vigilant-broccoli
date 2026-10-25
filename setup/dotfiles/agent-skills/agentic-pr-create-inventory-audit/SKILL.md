---
name: agentic-pr-create-inventory-audit
description: In vigilant-broccoli, find missing or stale rows in the fork identity inventory and the secret inventory and fix them without touching secret values.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Audit [fork-identity-inventory.md](../../../../docs/fork-identity-inventory.md) and the Secret Inventory in [secret-management.md](../../../../docs/infrastructure/secret-management.md) against the tree. Follow applicable context; edit only those two docs, keep one conservative change of at most 10 rows, and report the rest as skipped.

## Candidates

1. Run `bash scripts/ci/inventory-drift.sh`. It prints `MISSING_SECRET`, `STALE_SECRET`, `STALE_VALUE` and `UNLISTED_VALUE` lines from names and identity-shaped values only. Treat them as candidates, not verdicts.
2. Beyond the grep: secret names read from GCP Secret Manager or Vault in code, Terraform and workflows that the script's patterns miss, and fork-inventory rows (file counts, representative paths, hardcoded accounts, domains, identity values) whose paths no longer exist or whose values changed.

## Verification

- Missing: confirm the reference is live and not a comment or example, then add a row in the table's existing alphabetical position, with location (Vault path, `→ Fly`, GCP Secret Manager) and purpose taken from the referencing code. Vault paths come from the workflow or Terraform that reads them.
- Stale: search the bare name or value across the whole repository, including workflows, Terraform, Ansible, dotfiles and scripts. Remove or correct a row only with zero live references outside the two docs; otherwise skip it.
- Unlisted values: add one only when it is a hardcoded account, domain or identity value a fork must change. Public third-party values and personal content that is not config go under the doc's literal-values section or are skipped.

## Guardrails

- Never read, print, copy or write a secret value: names, locations and purposes only. Do not call Vault, `gcloud secrets` or any live service.
- Never edit `TODO.md`, workflows, Terraform or code to match a doc; the doc follows the tree.
- Keep table columns, ordering and the doc's Table of Contents consistent; update `docs/fork-identity-inventory.md` file counts only when verified by grep.
- Apply `docs/refactor-code-cleanup.md`; do not commit or publish. No verified drift means no edits.

Report each fix with its evidence, then list skipped candidates with reasons, including those over the row cap.

Unattended entry point: `pnpm agentic-pr-create-inventory-audit`.
