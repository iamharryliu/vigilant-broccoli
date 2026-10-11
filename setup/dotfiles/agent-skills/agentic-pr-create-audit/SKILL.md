---
name: agentic-pr-create-audit
description: In vigilant-broccoli, remove or rewrite documentation that describes legacy implementations which no longer apply to the current codebase.
---

Use the current vigilant-broccoli checkout and resolve repository paths from its Git root. If the current directory is outside that repo, ask which checkout to use; do not operate on the skill installation checkout by default.

Audit the repository's documentation for passages about legacy implementations that no longer apply to the current codebase and give a reader no value today, and remove them or rewrite them to describe the current state, in one conservative change. Unlike `/agentic-pr-create-prune`, which removes what has zero references, this judges documentation that is still accurate history but no longer useful; unlike `/agentic-pr-create-todo-audit`, it never touches `TODO.md`.

Read the root `CONTEXT.md` and every `CONTEXT.md` on the path to each directory you change, and follow the Doc Map rules (Table of Contents, nuances) for any doc you edit.

## Scope

In scope: Markdown under `docs/`, every `CONTEXT.md` and `README.md`, and code-adjacent docs (Markdown files beside the code they describe, such as `docs/features/` folders and sandbox or app READMEs).

Never touch:

- `notes/`, `docs/learning-timeline.md` and anything under `docs/rnd/` — they are records of their time by design.
- Changelog-style files (`CHANGELOG*.md`, release notes, the `## Agentic Change History` of a PR body and anything else that logs what changed when).
- Code, configuration, workflows and scripts, including comments inside them.
- `TODO.md` — `agentic-pr-create-todo-audit` owns it. Mention backlog-worthy findings in the report instead.
- Generated files and generated sections: anything a script or hook rewrites (the `repo-stats` counts in `README.md`, `about.md` and the resume bullet), lockfiles and build output.

## What to look for

1. Before-and-after passages — "previously X, now Y", "migrated from", "formerly", "used to", "legacy", "deprecated", "no longer", "replaced by", "renamed from" — where knowing the old way does not help someone working on the code now.
2. Sections, bullets or table rows about apps, services, scripts, workflows, env vars, secrets or providers that have been removed from the repository.
3. Rationale whose only purpose is to justify a change that long since landed ("we switched to X because Y was slow") rather than to explain a constraint that still holds.
4. Old-name lookup tables and "for reading old links" notes, unless something live (a URL, a stored record, an external system) still carries the old name.

## Keep or rewrite

- Keep history that explains a live constraint or prevents a repeat mistake, but rewrite it as the present-tense rule without the backstory: "Do not use `overrides` for fly service packages; it breaks their pruned installs" rather than "We used to use `overrides` until the fly deploys broke".
- Keep anything a reader still needs to operate the current system: migration steps still pending, compatibility shims still in the tree, old names that still appear in live URLs, data or external services.
- Rewrite rather than delete when a passage mixes the current state with its history; delete only the parts that are purely about the past.

## Verification rules

- Verify each candidate against the current tree before removing it. For a removed app, service, script, workflow, env var or provider, `grep -rn` (or `git grep -n`) the whole repository for its name, filename and path, including `.github/`, every `package.json` script, `project.json` targets, Dockerfiles, `docker-compose*.yml`, `fly*.toml`, Terraform, Ansible and `setup/dotfiles/`. Leave anything still referenced outside documentation.
- For a before-and-after passage, confirm the "after" is what the tree does now and the "before" no longer exists anywhere. If the old way still exists somewhere, the passage is live and stays.
- Record the grep command and its result, or the file you read, as the reason for each removal; that evidence goes in the PR body.
- When in doubt, skip. A skipped candidate is listed with its reason; a wrong removal deletes context nobody will think to restore.

## Guardrails

- Cap the change at 15 changed files. Rank candidates by value to a reader — whole stale sections and misleading instructions before one-word cleanups, and widely read docs (root and directory `CONTEXT.md`, Doc Map docs, READMEs) before rarely read ones — and edit the highest-value files first. List every candidate left over by the cap as skipped with reason "over the file cap", so a later run can pick up the rest.
- Edit prose only. Do not restyle, reorder or reword passages that are not legacy, and do not add new documentation.
- After editing, fix every relative Markdown link and `#anchor` that your change broke, in any file that links to an edited doc, and rebuild the Table of Contents of any doc whose headings changed per the Doc Map rule. Link and ToC fixes count toward the file cap.
- Run the root formatter on the files you changed (`pnpm exec prettier --check <files>`, then `--write` if needed) so the result matches the repo's Markdown style.
- Apply `docs/refactor-code-cleanup.md` to the result before finishing.
- Do not commit or publish changes. Read-only Git history inspection (`git log`, `git show`) is allowed and useful for confirming that something was removed.

It is a perfectly good outcome to find nothing worth removing. If no candidate survives verification, make no edits at all. Do not invent a change to justify the run.

## Report

List each removal or rewrite with its path, a short quote or description of what was removed or rewritten, and a one-line reason with its verification evidence. Then list every skipped candidate with its reason (still referenced, still a live constraint, uncertain, over the file cap), so a re-run can pick up the rest.

For the unattended sandbox + PR version, run `pnpm agentic-pr-create-audit` instead.
