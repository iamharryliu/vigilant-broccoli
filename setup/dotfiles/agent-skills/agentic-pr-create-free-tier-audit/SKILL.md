---
name: agentic-pr-create-free-tier-audit
description: In vigilant-broccoli, verify every cloud service in use has a Free Tier section in its notes/docs and a row in free-tier-infrastructure.md, adding or correcting entries only from verifiable sources.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Audit free-tier documentation. Read `docs/infrastructure/free-tier-infrastructure.md`, `docs/nuance-pattern.md` and `notes/CONTEXT.md` first. Keep one conservative change of at most 10 files, with remaining candidates reported as skipped.

## Candidates

- Cloud services referenced by `infrastructure/terraform/`, `projects/nx-workspace/deployment-configs/` (Fly configs), `.github/workflows/`, per-app `project.json` deploy targets and deployment configs that have no row in `free-tier-infrastructure.md`.
- Rows whose linked notes/docs lack a `## Free Tier` section with limits, or whose service is no longer used anywhere in those sources.
- Stale entries: limits that differ from the provider's official pricing/limits page, or from the service's `## Free Tier` section.

## Verification

- Confirm a service is in use by a concrete reference in Terraform, a Fly config, a workflow or a deployment config; cite the file.
- Write limits only from a verifiable source: the provider's official documentation fetched in this run, or an existing `## Free Tier` section in the repo. If neither is available, do not guess; skip the candidate and say why.
- A row mirrors the limits in its linked note's `## Free Tier` section; keep both consistent and follow the table's existing columns and ordering.
- For a service without a note, add the limits to its owning docs file or note section only when one exists; create no new file under `notes/`. In `notes/`, follow `notes/CONTEXT.md` (project-agnostic content, `.md` links, reachability, ToC rules).
- Remove a row only when no reference remains in any of the sources above.

## Guardrails

- Never edit `TODO.md`, Terraform, workflows, Fly configs or application code; edit Markdown only.
- Do not invent numbers, rewrite unrelated prose or restyle tables. Apply `docs/refactor-code-cleanup.md`; do not commit or publish.
- A clean run (every service covered and current) means no edits.

Report each addition or correction with its service, the file evidence of use and the source of each limit. List skipped candidates and reasons, including those over the cap.

Unattended entry point: `pnpm agentic-pr-create-free-tier-audit`.
