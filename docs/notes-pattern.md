# Notes Pattern

Convention for `notes/` — a tree of Markdown notes linked by relative paths (no static-site generator, no frontmatter indexing; navigation is entirely link-based, so a broken or missing link is a dead end).

## Index files

- Every directory with more than one file has an index file, and that index file's name must exactly match the directory's kebab-case name — e.g. `cooking/cooking.md`, `cooking/theory/cooking-theory.md`, `cooking/recipes/bread-recipes/bread-recipes.md`. A mismatch (`rice-dishes/rice-dish-recipes.md`, `vegetable-recipes/veggie-recipes.md`) is a bug — rename the file to match its directory rather than adding an exception.
- A directory's index links every direct child:
  - A subdirectory is linked as a single line pointing at _its_ index file (e.g. `[Recipes](./recipes/recipes.md)`) — never by inlining that subdirectory's leaf files into the parent index. Leaf files belong in exactly one index: the nearest one (the subdirectory's own), not duplicated further up the tree.
  - The exception is a subdirectory too small to warrant its own index page (one to a few files, e.g. `ingredients/sauce-recipes/`): its files may be enumerated directly in the parent index under a `##` heading instead.
- Within an index, entries are ordered alphabetically by link text.

## Links

- Always include the `.md` extension — `[X](./foo)` (missing extension) is a broken link, not a shorthand.
- Every note file must be reachable by clicking through from some index, starting at the relevant top-level index (e.g. `notes/hobbies/cooking/cooking.md`). An unlinked file is an orphan and should either be linked in or removed.
- External links (YouTube, recipe sites, etc.) are fine mixed inline alongside internal links within an index.

## Checking a subtree

There's no automated check for this — when adding or restructuring notes, verify by hand (or with a short script) that every relative link resolves to a real file and every `.md` file under the subtree is linked from somewhere.
