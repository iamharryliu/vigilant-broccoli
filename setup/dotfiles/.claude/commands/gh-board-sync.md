Sync sub-boards to reflect the master board `vigilant-broccoli` for owner iamharryliu.

Discover the layout at runtime — do not hardcode project numbers or area names:

- Master = the project titled `vigilant-broccoli`.
- Areas = the options of master's `Area` single-select field.
- Sub-board for an area = the project whose title matches that area name.
- An item with no `Area`, or with an area that has no matching project title, stays only on master.

Steps:

1. For each item on master, ensure it exists on the matching sub-board (add if missing) and copy `Status` from master.
2. For each sub-board item, remove it if the matching master item's `Area` no longer points to that sub-board (or the issue is missing from master).

Use `gh project list`, `gh project field-list`, `gh project item-list`, `gh project item-add`, `gh project item-delete`, and `gh project item-edit`.
