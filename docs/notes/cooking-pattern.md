# Cooking Notes Pattern

Index-file convention specific to `notes/hobbies/cooking/`. The universal link-hygiene rules that apply to all of `notes/` are in [notes-pattern.md](../notes-pattern.md) — this doc only covers what's specific to cooking.

## Index files

- Every directory with more than one file has an index file, and that index file's name must exactly match the directory's kebab-case name — e.g. `cooking/cooking.md`, `cooking/theory/cooking-theory.md`, `cooking/recipes/bread-recipes/bread-recipes.md`. A mismatch (`rice-dishes/rice-dish-recipes.md`, `vegetable-recipes/veggie-recipes.md`) is a bug — rename the file to match its directory rather than adding an exception.
- A directory's index links every direct child:
  - A subdirectory is linked as a single line pointing at _its_ index file (e.g. `[Recipes](./recipes/recipes.md)`) — never by inlining that subdirectory's leaf files into the parent index. Leaf files belong in exactly one index: the nearest one (the subdirectory's own), not duplicated further up the tree.
  - The exception is a subdirectory too small to warrant its own index page (one to a few files, e.g. `ingredients/sauce-recipes/`): its files may be enumerated directly in the parent index under a `##` heading instead.
- Within an index, entries are ordered alphabetically by link text.
