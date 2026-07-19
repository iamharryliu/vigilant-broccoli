Create a well-researched task entry in the repo root `TODO.md` for the feature, fix, or migration described in the arguments (or in this conversation).

1. Read `TODO.md` to learn its structure: the section headings (e.g. `## Features to Add`, `## P1`–`## P3`) and entry format — `### <6-hex-id>. [category] Title`, a short context paragraph, then steps.
2. Research before writing: grep the repo for every file, workflow, config, and doc the task touches. The entry must cite concrete paths (with line numbers where useful, e.g. `path/to/file.ext:12`) and name an existing pattern to follow when one exists — not vague descriptions.
3. Check `CLAUDE.md` for conventions that constrain the task (e.g. Upptime checks for deployed services, no new GitHub repo secrets, cheatsheet/README/badge sync rules) and bake them into the steps.
4. Generate a unique 6-hex id (e.g. `python3 -c "import random; print(format(random.randint(0, 0xffffff), '06x'))"`) and verify it doesn't already appear in `TODO.md`.
5. Add the entry under the most fitting section (create the section if the user asked for a new one):
   - `### <id>. Title` — include a `[security]`/`[performance]`/`[maintenance]` tag when it matches the section's style.
   - One context paragraph: current state with file references, and the desired end state.
   - A numbered `Steps:` list — each step actionable and tied to specific files, including the reference-update/cleanup steps so nothing dangles after the change (docs, workflows, links, status checks).
6. Do not implement the task — the deliverable is the TODO entry only. Do not commit.
