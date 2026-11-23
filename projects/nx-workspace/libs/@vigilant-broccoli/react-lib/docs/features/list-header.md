# List Header

A title row with a trailing control, and the Sort select that goes in it.

## Usage

- `ListHeader` puts `title` on the left and its children on the right of one row, so the control stays inline with the title instead of dropping onto its own line. Used by `GoogleTasks` and hearth's grocery page.
- `SortSelect` is a "Sort:" label plus `Select` for string-valued sort modes: pass `value`, `onValueChange`, the `options` array and a `labels` record, optionally `label` and `placeholder`.
- Inside a `CardContainer` the card owns the title, so pass the `SortSelect` to its `headerAction` rather than wrapping it in a `ListHeader`. Used by hearth's Kitchen Planner grocery card.
- The components hold no sort state; the caller owns the mode and the sorting, and disables drag-reorder in non-default modes (see `GoogleTasks`).
