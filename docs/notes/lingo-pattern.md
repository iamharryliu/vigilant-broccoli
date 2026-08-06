# Lingo Files Pattern

Template convention for glossary files under `notes/` (e.g. `tech-lingo.md`, `software-lingo.md`, `computer-hardware-lingo.md`, `network-security-lingo.md`). The universal link-hygiene rules that apply to all of `notes/` are in [notes-pattern.md](../notes-pattern.md) — this doc only covers what's specific to lingo files.

## Structure

1. `#` title.
2. A table of contents — a flat list of links to each `##` subheader, e.g. `- [Architecture](#architecture)`. Skip this step if the file has no subheaders (a single flat table).
3. One `##` subheader per term group, each containing a single `Term | Definition` (or `Description`) markdown table. Rows within a table are ordered alphabetically by term.

Grouping is only added once a flat table gets large enough that scanning it is hard — small lingo files can stay a single table with no subheaders or table of contents.
