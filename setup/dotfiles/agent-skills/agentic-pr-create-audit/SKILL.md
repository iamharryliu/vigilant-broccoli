---
name: agentic-pr-create-audit
description: In vigilant-broccoli, remove or rewrite documentation that describes legacy implementations which no longer apply to the current codebase.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Remove or rewrite stale implementation history in Markdown after verifying it against current code. This operation edits at most 15 files and never changes `TODO.md`.

## Scope

Audit `docs/`, `CONTEXT.md`, READMEs and code-adjacent Markdown. Exclude `notes/`, `docs/rnd/`, `docs/learning-timeline.md`, changelogs/release histories, generated files/sections, code, configuration, workflows and scripts.

## Candidates

Look for obsolete before/after narratives, removed components or names, and historical rationale that no longer explains a constraint. Keep live compatibility names, pending migrations, and setup/bootstrap/recovery instructions with their ordering and one-time gotchas. Rewrite mixed passages as current rules; delete only obsolete parts.

## Verification

- Verify each candidate against source before editing. Search names, filenames and paths across tracked and hidden repo files, including scripts, targets, workflows, deployment configs, infrastructure and dotfiles. A live reference or unresolved uncertainty means keep it.
- For before/after claims, confirm the new behavior and search for surviving old implementations.
- Record searches/results or inspected source as evidence for each edit. Read-only Git history may help.

## Editing and report

- Prioritize misleading instructions and widely read docs. Do not add documentation or change unrelated wording/style; prose and resulting link/ToC repairs are the only edits, all within the 15-file cap.
- Follow applicable context, repair incoming links/anchors and rebuild changed ToCs. Format changed files and apply `docs/refactor-code-cleanup.md`.
- Report each edit with path, removed/replaced claim and evidence; list skipped candidates with reasons, including those over the cap. Report backlog findings without editing `TODO.md`.
- Do not commit or publish. A verified clean audit makes no edits.

Unattended entry point: `pnpm agentic-pr-create-audit`.
