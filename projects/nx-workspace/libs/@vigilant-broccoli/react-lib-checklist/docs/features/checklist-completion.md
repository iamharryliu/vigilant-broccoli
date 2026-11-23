# Checklist completion

## Behavior

- Completing and reopening rows use a brief collapse and arrival transition in card and dense checklists.
- Rows present when `CheckListBase` mounts do not animate; every id that appears afterwards slides in (`checklist-item-new`, 300 ms). `isNew: true` forces the slide-in.
- Reduced motion disables the slide-in, completion and populate animations.
- Completion counts reflect current data while rows finish moving between sections.
- Write errors keep existing rows visible alongside the error so rollback remains usable.
- Sortable membership follows the visible active rows without changing task drag payloads.
- Expanding the Completed section fades its rows in with a short stagger (user toggles only, never the restored saved state; disabled under reduced motion).

## Row identity

- Transitions are keyed by a row key rather than the item id. A new item whose `transitionFromId` names a row that left in the same update inherits that row's key: its DOM node and any running transition carry over, and it plays the completion transition when `checked` differs.
- So a re-keyed row, such as a pending occurrence replaced by a completion with a temporary id and then a saved one, collapses and arrives once; the temp-to-saved swap is invisible.
- A new id that collides with a key still in use gets a suffixed key, so it slides in as a new row.

## Consumer contract

- Mount the list after the first load (`CheckList`'s `loading`, or render a skeleton) so loaded rows are not treated as additions; later refetches can keep it mounted.
- Keep ids stable across completion, or set `transitionFromId` on the replacement item, including when rolling back.
- Update optimistically, set `isRemoving` on the row while its write is pending (the checkbox is disabled and the toggle should be ignored), and restore the original state when the write fails.
- Expose row deletion through `onDeleteItem` (the ellipsis menu's confirmed Delete), applying the same `isRemoving` and rollback rules.
