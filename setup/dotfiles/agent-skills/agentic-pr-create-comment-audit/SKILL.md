---
name: agentic-pr-create-comment-audit
description: In vigilant-broccoli, enforce the Coding Conventions comment rule repo-wide by removing redundant comments and generator scaffolding while keeping comments that explain non-obvious reasons.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Enforce the root `CONTEXT.md` Coding Conventions comment rule repo-wide: comments explain non-obvious reasons, constraints or traps. Make comment-only edits, about 20 files per run, leaving remaining candidates as follow-ups.

## Candidates

- Comments that restate the next line of code, a name or a type.
- Generator scaffolding and boilerplate (framework template banners, "Created by" headers, default placeholder comments).
- Commented-out code and stale change-log narration.

## Keep

- Comments explaining a non-obvious reason, constraint, workaround or trap.
- A comment that is an empty block's sole body, and `TODO`/`FIXME` and lint, type-check or tool directives (`eslint-disable`, `@ts-expect-error`, `prettier-ignore`, `shellcheck`, `istanbul`, license or shebang lines).
- JSDoc/Swagger/OpenAPI text that is consumed by tooling or published, and comments in generated files or `node_modules`.

When unsure whether a comment records a reason, keep it and list it as skipped.

## Guardrails

- Edit comments only: no code, string, whitespace-significant or formatting changes. Do not re-align trailing comments; Prettier owns spacing, and removing a comment must not leave a stray blank line or trailing space.
- Never edit `TODO.md`, `notes/`, migrations, Terraform state or lockfiles, and do not create, delete or rename files.
- Run the lint and typecheck targets of affected projects (`npx nx affected -t lint typecheck --base=HEAD` from `projects/nx-workspace`) plus Prettier on edited files; revert any file that fails.
- Apply `docs/refactor-code-cleanup.md`; do not commit or publish. No violating comments means no edits.

Report each edit with its path, the removed comment and the reason. List skipped candidates and reasons, including those over the cap.

Unattended entry point: `pnpm agentic-pr-create-comment-audit`.
