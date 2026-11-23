# Checklist

Shared checklist behind the grocery list and kitchen chores pages (`src/app/components/Checklist.tsx`).

## Features

- Renders `CheckList` from `@vigilant-broccoli/react-lib-checklist` with dense separated rows, an `input` editor and large text; completed items are read-only and listed under a collapsible `Completed (n)` section.
- A thin adapter maps the hearth `ChecklistItem` (`name`, `completed`, `completedAt`) to the generic base item; fetching, optimistic add/toggle/rename/delete and auth/home providers stay in the component.
- Shows `ChecklistSkeleton` until the first fetch for a home resolves, then mounts `CheckList`, so added items slide in and loaded ones do not; a `refreshSignal` refetch keeps the list mounted.
- Toggles mark the row `isRemoving` while the write is pending (`usePendingWrites`), ignore repeat taps and roll back on failure, per the [completion contract](../../../../libs/@vigilant-broccoli/react-lib-checklist/docs/features/checklist-completion.md).
- Active grocery and kitchen chore items can be reordered by their drag handles; order persists per home and new items are appended.
- The grocery list (`sectionSortMode`, set by `GroceryList`) shows a store-section badge inline at the end of each active row (produce, bakery, meat & seafood, dairy, frozen, pantry, snacks, beverages, household, other) and a Sort select (Default or Store section) to the right of the title (`GrocerySortSelect`; the grocery page header row, the kitchen planner card's `headerAction`), the same pattern as Google Tasks, with the mode held by the caller via `useGrocerySortMode` (localStorage). The section is derived from the item name by a fixed keyword map (`grocery/grocery-sections.consts.ts`, `getGrocerySection`), not stored, so it needs no column and a rename re-tags the row. Store section sort orders active rows in store-walk order and turns drag-reorder off; Default sort keeps the saved order and dragging.
- Each row's `⋮` menu (passed via `renderItemAccessory`) offers Add to calendar (opens `CalendarEventForm` in a dialog, posts a kitchen event) and Delete (confirmation dialog).
- Completed items sort by `completedAt`, newest first, under `CheckListBase`'s day headers.
