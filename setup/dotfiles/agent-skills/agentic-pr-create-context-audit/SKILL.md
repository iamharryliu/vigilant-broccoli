---
name: agentic-pr-create-context-audit
description: In vigilant-broccoli, slim agent guidance by removing duplicated rules and incident narrative without losing any rule, workaround, recovery step or exact error string.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Slim repository agent guidance so it costs fewer tokens to read while every agent-relevant fact stays findable. This operation edits at most 15 existing files, never changes `TODO.md` and changes no skill's behavior.

## Scope

- Every `CONTEXT.md`, root and directory-scoped; never edit the adjacent `AGENTS.md`/`CLAUDE.md` adapter symlinks.
- Bodies of shared `setup/dotfiles/agent-skills/*/SKILL.md` files. Frontmatter stays byte-identical so `name`/`description` and the commands they define do not change; never edit the `setup/dotfiles/.claude/commands/` adapters.
- Documents in the root `CONTEXT.md` Doc Map, and Markdown docs root `CONTEXT.md` directs agents to read before a class of work (its "Read [x](./x.md) before ..." sentences, e.g. `ui-app-pattern.md`, `fly-service-pattern.md`). Other linked docs are out of scope. The runner resolves both lists from the base commit, so editing root `CONTEXT.md` cannot widen the scope.

Exclude `notes/` (including `notes/CONTEXT.md`), `docs/rnd/`, `docs/learning-timeline.md`, `TODO.md`, changelogs, generated sections (such as `managed:repo-stats`), code, configuration, workflows and scripts. Edit files in place; do not create, delete or rename them.

## Candidates

- A rule restated in several places: keep it in its owner per [documentation placement](../../../../docs/agent-support.md#documentation-placement) and link there from the others.
- Boilerplate repeated across files, such as identical preambles or restated root rules.
- Incident narratives: compress to the mechanism, the current workaround and the recovery checks.
- Implementation inventories derivable from code, and nuances whose trap an explanatory code comment now guards.

## Never lose

- Rules and prohibitions.
- Workarounds for external or upstream constraints, and why they exist.
- Recovery and redeploy steps and their ordering.
- Exact error messages and symptom strings in nuances: agents find a nuance by searching for the error text, so a paraphrase hides it.
- The reason behind a non-obvious rule when it aids diagnosis, e.g. why a `"*"` dependency pin drifts and surfaces as duplicate `FastifyInstance` types in root `CONTEXT.md`.
- Concrete examples that steer agent behavior, e.g. the comment-rule examples in `docs/refactor-code-cleanup.md`.
- Search heuristics in skills, such as `agentic-pr-create-audit`'s candidate phrases.
- Live pending-work pointers (TODO IDs, follow-ups, pending migrations).

Compression must keep the same obligation: do not widen or narrow what a skill or rule asks for.

## Verification

- For every removed fact, record one piece of evidence: the new text that retains it, the `file:line` where it already lives (and is reachable through a required reading link), or the code that makes it derivable. If none applies, keep the fact.
- Before "correcting" a claim, check it against the tree: count the cases it covers rather than trusting the document or your expectation. Leave the claim alone if the tree disagrees with the correction.
- Rebuild changed ToCs per root `CONTEXT.md` Documentation rules, and repair incoming links and anchors after renaming headings.
- Format changed files and apply `docs/refactor-code-cleanup.md`.

## Editing and report

- Prioritize the most-read files: root `CONTEXT.md`, Doc Map and required-reading documents, then high-traffic skills. Stop at the cap and list the rest as skipped.
- Report per file what was cut and, for each removed fact, where it is retained with the evidence above. List skipped candidates with reasons, including those over the cap. Report backlog findings without editing `TODO.md`.
- Do not commit or publish. When nothing can be slimmed safely, make no edits.

Unattended entry point: `pnpm agentic-pr-create-context-audit`.
