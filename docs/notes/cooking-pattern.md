# Cooking Notes Pattern

Index-file convention specific to `notes/hobbies/cooking/`. The universal link-hygiene rules that apply to all of `notes/` are in [notes-pattern.md](../notes-pattern.md) — this doc only covers what's specific to cooking.

## Index files

- Every directory with more than one file has an index file, and that index file's name must exactly match the directory's kebab-case name — e.g. `cooking/cooking.md`, `cooking/theory/cooking-theory.md`, `cooking/recipes/bread-recipes/bread-recipes.md`. A mismatch (`rice-dishes/rice-dish-recipes.md`, `vegetable-recipes/veggie-recipes.md`) is a bug — rename the file to match its directory rather than adding an exception.
- A directory's index links every direct child:
  - A subdirectory is linked as a single line pointing at _its_ index file (e.g. `[Recipes](./recipes/recipes.md)`) — never by inlining that subdirectory's leaf files into the parent index. Leaf files belong in exactly one index: the nearest one (the subdirectory's own), not duplicated further up the tree.
  - The exception is a subdirectory too small to warrant its own index page (one to a few files, e.g. `ingredients/sauce-recipes/`): its files may be enumerated directly in the parent index instead, as one of the categories described in [Grouping entries within an index](#grouping-entries-within-an-index).
- Within an index, entries are ordered alphabetically by link text; grouped indexes follow the ordering rules below.

## Grouping entries within an index

A flat list of links is the default — only group entries once an index is long enough that a reader has to scan it. Grouping takes one of two shapes:

- **Nested list** (preferred for indexes that fit on a screen): one bold category label per group directly under the `# Title`, with that category's links indented beneath it. No headings and therefore no `## Table of Contents` — the list _is_ the index, so don't repeat the same links in `##` sections below it or the two copies drift apart.
- **`##` sections**: one heading per category, with a `## Table of Contents` of anchor links above them. Use this only once the nested list is too long to skim, so the headings earn the jump links.

Either way:

- A category names a **kind of ingredient or dish**, not a directory. Folders are storage; the index is for reading, so a category may group loose files, a subdirectory's files, or both.
- **Every entry sits in a category.** No ungrouped list above the first one — anything that would land there means a category is missing.
- **Entries are alphabetical within a category.** Categories themselves are alphabetical too, except that an index may lead with the one or two groups it's most often opened for (e.g. `Produce`, then `Preparations`) before the alphabetical remainder.
- A category may hold one level of **sub-categories** when its entries split cleanly (e.g. `Preparations` → `Sauces`, `Stocks`); past that, the group is big enough to become its own subdirectory and index instead.
- A category holding a single entry is fine as a growth slot; one invented to hold a file that will never gain siblings should be folded into a neighbour.
- Categorise by what a thing **is** (`Produce`, `Pantry Staples`, `Seasonings`), not by what it's used for — usage-based groupings stop working as the note count grows.
- Promote a category to its own subdirectory and index once it passes roughly four files; the parent then collapses that whole group to a single link, per [Index files](#index-files).

## Ingredients vs food notes

Both `ingredients/` and `food-notes/` describe foods, so the split is by question answered:

- `ingredients/` — **what it is and how to choose it**: varieties, origin, starch or fat content, buying, storing.
- `food-notes/` — **how to cook it**: techniques, timings, doneness, what to pair it with.

A food with enough of both (e.g. potatoes) gets a file in each, cross-linked, rather than one file that mixes the two.

A recipe index is the exception: when reference material covers exactly the category a recipe directory already holds (e.g. `recipes/side-recipes/banchan/`), it goes in that index above the recipe links rather than in a second file elsewhere — one topic, one file, with the recipe list as a `## Recipes` section.
