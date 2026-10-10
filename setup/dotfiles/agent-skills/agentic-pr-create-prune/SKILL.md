---
name: agentic-pr-create-prune
description: In vigilant-broccoli, find dead code, unused dependencies and stale or broken documentation repo-wide and remove only what has verifiably zero references.
---

Use the current vigilant-broccoli checkout and resolve repository paths from its Git root. If the current directory is outside that repo, ask which checkout to use; do not operate on the skill installation checkout by default.

Prune dead code and stale documentation across the whole repository in one conservative change. Unlike `/refactor-code-cleanup`, which only reviews the current diff, this sweeps the tree as it stands; unlike `/agentic-pr-create-todo-audit`, it never touches `TODO.md`.

Read the root `CONTEXT.md` and every `CONTEXT.md` on the path to each directory you change, and follow the Doc Map rules (Table of Contents, nuances) for any doc you edit.

## What to look for

1. Dead code — unused exports, files, functions and types in `projects/nx-workspace` libs and apps. You may run `npx --yes knip` ad hoc from `projects/nx-workspace` if it works in this environment; treat its output as candidates to verify, never as truth, and do not add knip (or any tool) as a dependency or config file.
2. Unused dependencies declared in a lib/app `package.json`, and in the root `package.json` when nothing in the workspace imports them. Keep the root-pinning rule in `CONTEXT.md`'s App Development section: never leave a lib/app specifier that diverges from the root's caret range.
3. Stale documentation — broken relative markdown links and anchors; docs, `CONTEXT.md` nuances and README sections describing files, scripts, env vars, workflows or commands that no longer exist; Table of Contents drift per the Doc Map rule.
4. Orphaned docs — files under `docs/` that nothing links to. Relink them from the Doc Map or the nearest parent doc, or report them; delete one only when it is clearly superseded by another doc that you cite.
5. Root `package.json` scripts pointing at missing files, and `docs/cheatsheet.md` / `docs/cheatsheet-aliases.md` entries that have drifted from `package.json` and `setup/dotfiles/`.
6. Orphaned workflow files, composite actions under `.github/actions/`, and scripts under `scripts/` or `infrastructure/` that nothing invokes.
7. Leftover debug `console.log` statements and commented-out code blocks.

## Verification rules

- A candidate is removable only when `grep -rn` (or `git grep -n`) over the whole repository finds zero references outside its own definition. Search for the bare name, the filename, the filename without extension, and the path; include `.github/`, every `package.json` script, `project.json` targets, `docs/`, `notes/`, `setup/dotfiles/`, Dockerfiles, `docker-compose*.yml`, `fly*.toml`, Terraform and Ansible files, and `.pre-commit-config.yaml`.
- Check for dynamic references before removing anything: string-built paths and imports, `import()`/`require()` with variables, glob patterns (`scripts/*.sh`, `apps/*`), Nx inferred targets, Next.js file-system routes and route handlers, framework entry points and config files loaded by convention, and env var names read through `getEnvironmentVariable`. If any could reach the candidate, skip it.
- Record the exact grep command and its zero-match result for every removal; that evidence goes in the PR body.
- When in doubt, skip. A skipped candidate is listed with its reason; a wrong removal breaks something nobody is looking at.

## Guardrails

- Never change `notes/` content; only fix broken links inside it.
- Never touch `TODO.md` — `agentic-pr-create-todo-audit` owns it. Mention backlog-worthy findings in the report instead.
- Never remove an export of a published npm package (see `docs/app-development/app-development.md#npm-package-publishing`), a Swagger-documented route, a database migration, or Terraform state.
- Do not refactor, rename or restyle working code. Removal and link/ToC repair are the only edits; a doc sentence may be rewritten only where it describes something that no longer exists.
- Cap the change at about 40 files so it stays reviewable. When there are more candidates, prune the highest-confidence ones, keeping categories together so the PR merges as one coherent increment, and list the rest as follow-ups per [pull request scope](../../../../docs/agent-support.md#pull-request-scope).
- After removing an export or dependency, run `pnpm install --lockfile-only` from the root if a `package.json` changed, then run the affected checks from `projects/nx-workspace`: `npx nx affected -t lint typecheck build --base=HEAD` (fall back to the specific projects' targets if `affected` cannot resolve a base). Revert any removal that breaks a check rather than fixing forward.
- Apply `docs/refactor-code-cleanup.md` to the result before finishing.
- Do not commit or publish changes. Read-only Git history inspection is allowed.

It is a perfectly good outcome to find nothing provably dead. If no candidate survives verification, make no edits at all. Do not invent a change to justify the run.

## Report

Group the removals by the seven categories above. For each item give the path (and symbol), what was removed or fixed, and the zero-reference evidence. Then list every skipped candidate with the reason it was skipped (dynamic reference, public export, uncertain, over the file cap).

For the unattended sandbox + PR version, run `pnpm agentic-pr-create-prune` instead.
