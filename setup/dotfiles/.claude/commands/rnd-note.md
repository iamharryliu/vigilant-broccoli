Research the question in the arguments (or in this conversation) and write a concise R&D note under `docs/rnd/`.

1. Read `docs/rnd/README.md` and follow its template and rules **exactly**: `# R&D: <Title>`, a one-line blockquote restating the question with today's date, then `## Context`, `## Alternatives`, `## Recommendation`, `## Sample Implementation` — in that order.
2. `## Alternatives` is a markdown table with columns `Option | Pros | Cons | Cost | Security | Scalability`, at least two options, every cell filled (use `—` when a cell genuinely does not apply).
3. Research before writing. When the question touches this repo, grep for the relevant files, patterns, and docs and cite concrete paths (e.g. `path/to/file.ext:12`) in Context and Sample Implementation. Prefer patterns already used in the repo — check `CLAUDE.md` and the docs it links.
4. Be **brief**: favor the table and short sentences over prose. No preamble, no conclusion beyond the recommendation.
5. Write the note to a new file `docs/rnd/<concise-kebab-slug>.md`; do not modify anything outside `docs/rnd/`. Do not commit.

For the unattended sandbox + PR version, run `pnpm agentic:rnd "<question>"` instead.
r
