Audit the codebase for the scope in the arguments (or in this conversation) and write a concise findings note under `docs/audit/`.

1. Read `docs/audit/audit-template.md` and follow its template and rules **exactly** — that file is the source of truth for the note's structure, format, and brevity.
2. Actually audit: grep the repo for the patterns in scope and inspect the matches. Every finding cites a concrete path (e.g. `path/to/file.ext:12`) and a severity. Report only real issues found — do not speculate; a clean audit (no findings) is a valid result.
3. Write the note to a new file `docs/audit/<concise-kebab-slug>.md`; do not modify anything outside `docs/audit/` (do not fix the findings — the note is the deliverable). Do not commit.

For the unattended sandbox + PR version, run `pnpm agentic:audit "<scope>"` instead.
