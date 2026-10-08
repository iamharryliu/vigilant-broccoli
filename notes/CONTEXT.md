# Agent Context — notes/

Agent guidance for editing notes: a tree of Markdown notes linked by relative paths (no static-site generator, no frontmatter indexing), so a broken or missing link is a dead end. This file is repository agent guidance, not a general-reference note.

## Table of Contents

- [Content Scope](#content-scope)
- [Links and Reachability](#links-and-reachability)
- [Table of Contents Convention](#table-of-contents-convention)
- [Topic-Specific Conventions](#topic-specific-conventions)

## Content Scope

- Notes are agnostic to this repo: general reference material (tech concepts, product comparisons, how-tos) that would read the same in any project. Don't name this repo's apps, paths, or hostnames; repo-specific usage and decisions belong in `docs/`.
- Do not add external links to notes unless explicitly requested (YouTube, recipe sites, etc.); when requested they may be mixed inline alongside internal links within an index. Prefer links to existing local notes.

## Links and Reachability

- Internal note links are relative and must include the `.md` extension — `[X](./foo)` is a broken link, not a shorthand. General link and anchor rules are in the root [Documentation](../CONTEXT.md#documentation) conventions.
- Every note file must be reachable by clicking through from some index. An unlinked file is an orphan: link it in or remove it.
- There is no automated check. When adding or restructuring notes, verify by hand (or with a short script) that every relative link resolves to a real file and every `.md` file under the subtree is linked from somewhere.

## Table of Contents Convention

- Every note starts with a `## Table of Contents` directly under the `# Title`, listing its `##`/`###` headings as anchor links (`- [Heading Name](#heading-name)`), nested to match the heading levels. Add one to any note missing it and keep it in sync when headings change. A note with no headings below the title doesn't need one.
- Table ordering follows the root [Documentation](../CONTEXT.md#documentation) conventions.

## Topic-Specific Conventions

Individual top-level topics layer on stricter conventions (index-file naming, how subdirectories get linked, entry ordering, etc.); these vary by topic and should not be assumed to carry over. Read the applicable one before restructuring a subtree.

- [Board Games](../docs/notes/board-games-pattern.md) — `notes/hobbies/board-games/`
- [Cooking](../docs/notes/cooking-pattern.md) — `notes/hobbies/cooking/`
- [Lingo Files](../docs/notes/lingo-pattern.md) — glossary files anywhere under `notes/` (e.g. `tech-lingo.md`, `software-lingo.md`)
