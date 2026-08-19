# Notes Pattern

Convention for `notes/` — a tree of Markdown notes linked by relative paths (no static-site generator, no frontmatter indexing; navigation is entirely link-based, so a broken or missing link is a dead end).

## Universal rules

These apply repo-wide, regardless of topic:

- `notes/` content must be agnostic to this repo — general reference material (tech concepts, product comparisons, how-tos) that would read the same in any project. Don't name this repo's apps, paths, or hostnames; repo-specific usage/decisions belong in `docs/` instead.
- Links are relative Markdown links and must always include the `.md` extension — `[X](./foo)` (missing extension) is a broken link, not a shorthand.
- Every note file must be reachable by clicking through from some index. An unlinked file is an orphan and should either be linked in or removed.
- External links (YouTube, recipe sites, etc.) are fine mixed inline alongside internal links within an index.
- There's no automated check for this — when adding or restructuring notes, verify by hand (or with a short script) that every relative link resolves to a real file and every `.md` file under the subtree is linked from somewhere.

## Topic-specific conventions

Beyond the universal rules, individual top-level topics under `notes/` layer on their own stricter conventions (index-file naming, how subdirectories get linked, entry ordering, etc.) — these vary by topic and should not be assumed to carry over from one to another. Check for a doc under `docs/notes/` before restructuring a subtree.

- [Cooking](./notes/cooking-pattern.md) — `notes/hobbies/cooking/`
- [Lingo Files](./notes/lingo-pattern.md) — glossary files anywhere under `notes/` (e.g. `tech-lingo.md`, `software-lingo.md`)
