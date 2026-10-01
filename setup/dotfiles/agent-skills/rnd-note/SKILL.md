---
name: rnd-note
description: In vigilant-broccoli, research a question and write an R&D note under docs/rnd/ from the R&D template.
---

Use the current vigilant-broccoli checkout and resolve repository paths from its Git root. If the current directory is outside that repo, ask which checkout to use; do not operate on the skill installation checkout by default.

Research the question in the arguments (or in this conversation) and write a concise R&D note under `docs/rnd/`.

1. Read `docs/rnd/rnd-template.md` and follow its template and rules **exactly** — that file is the source of truth for the note's structure, format, and brevity.
2. Research before writing. When the question touches this repo, grep for the relevant files, patterns, and docs and cite concrete paths (e.g. `path/to/file.ext:12`) in Context and Sample Implementation. Prefer patterns already used in the repo — check `CONTEXT.md` and the docs it links.
3. Write the note to a new file `docs/rnd/<concise-kebab-slug>.md`; do not modify anything outside `docs/rnd/`. Do not commit.

For the unattended sandbox + PR version, run `pnpm agentic:rnd "<question>"` instead.
