---
name: agentic-pr-create-prune
description: In vigilant-broccoli, find dead code, unused dependencies and stale or broken documentation repo-wide and remove only what has verifiably zero references.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Prune verifiably unused code and stale docs repo-wide. Follow applicable context; keep one conservative change of about 40 files, with remaining candidates as follow-ups.

## Candidates

- Unused exports, files, functions, types and dependencies. Optional ad hoc `npx --yes knip` from `projects/nx-workspace` supplies candidates only; do not install/configure a new tool.
- Broken links/anchors, stale context/README sections, ToC drift and missing script targets or cheatsheet drift.
- Orphaned docs, workflows, composite actions and scripts; leftover debug logs/commented-out code.

## Verification

Search each candidate's bare name, filename/stem and path across the whole repository, including hidden workflows, scripts/targets, docs/notes, dotfiles, deployment configs, Terraform, Ansible and hooks. Require zero references outside its definition. Check dynamic imports/paths, globs, inferred targets, filesystem routes, convention-loaded config and env var names read through `getEnvironmentVariable` before deleting. Skip anything potentially reachable.

Record exact searches and zero-match results for removals. Orphaned docs should be relinked or reported; delete only if demonstrably superseded and cite the replacement.

## Guardrails

- Never edit `TODO.md`; in `notes/`, only repair broken links.
- Never remove published-package exports, Swagger-documented routes, database migrations or Terraform state.
- No refactors, renames or restyling: only removals, link/ToC repairs, and sentences describing removed things. Preserve dependency ranges matching the workspace root.
- If manifests change, run `pnpm install --lockfile-only` at the appropriate workspace root. After export/dependency removals, run `npx nx affected -t lint typecheck build --base=HEAD` from `projects/nx-workspace`, or affected project targets if the base cannot be resolved. Revert removals that break checks.
- Apply `docs/refactor-code-cleanup.md`; do not commit or publish. No verified candidates means no edits.

Report removals grouped by category, with paths/symbols and evidence. List skipped candidates and reasons, including those over the cap; report unrelated backlog findings without implementing them.

Unattended entry point: `pnpm agentic-pr-create-prune`.
