Create a well-researched task entry in the repo's task tracker for the feature, fix, or migration described in the arguments (or in this conversation).

1. Find the tracker: look for a root `TODO.md` first. If one exists, read it to learn its structure — section headings and entry format (e.g. an id scheme, category tags, context paragraph, steps) — and match whatever format is already in use, don't invent a new one. If no `TODO.md` exists, check `CLAUDE.md`/`README.md` for a pointer to where tasks are tracked (issue tracker, project board, etc.); if none is documented, ask the user where the task should go.
2. Research before writing: grep the repo for every file, workflow, config, and doc the task touches. The entry must cite concrete paths (with line numbers where useful, e.g. `path/to/file.ext:12`) and name an existing pattern to follow when one exists — not vague descriptions.
3. Check `CLAUDE.md` (or equivalent repo conventions doc) for constraints that apply to the task (e.g. required status checks for deployed services, secret-handling rules, doc/README sync rules) and bake them into the steps.
4. If the tracker's entries use a generated id (e.g. a 6-hex id like `python3 -c "import random; print(format(random.randint(0, 0xffffff), '06x'))"`), generate one the same way and verify it doesn't already appear in the tracker.
5. Add the entry under the most fitting section (create the section if the user asked for a new one), matching the tracker's existing format:
   - Title, with a category tag when the section's style uses one.
   - One context paragraph: current state with file references, and the desired end state.
   - A numbered `Steps:` list — each step actionable and tied to specific files, including the reference-update/cleanup steps so nothing dangles after the change (docs, workflows, links, status checks).
6. Do not implement the task — the deliverable is the tracker entry only. Do not commit.
