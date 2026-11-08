# Checklist

Shared checklist behind the grocery list and kitchen chores pages (`src/app/components/Checklist.tsx`).

## Features

- Renders `CheckList` from `@vigilant-broccoli/react-lib` with dense separated rows, an `input` editor and large text; completed items are read-only and listed under a collapsible `Completed (n)` section.
- A thin adapter maps the hearth `ChecklistItem` (`name`, `completed`, `completedAt`) to the generic base item; fetching, optimistic add/toggle/rename/delete and auth/home providers stay in the component.
- Shows `ChecklistSkeleton` until the first fetch for a home resolves, then mounts `CheckList`, so added items slide in and loaded ones do not; a `refreshSignal` refetch keeps the list mounted.
- Toggles mark the row `isRemoving` while the write is pending (`usePendingWrites`), ignore repeat taps and roll back on failure, per the [completion contract](../../../../libs/@vigilant-broccoli/react-lib/docs/features/checklist-completion.md).
- Active grocery and kitchen chore items can be reordered by their drag handles; order persists per home and new items are appended.
- Each row's `⋮` menu (passed via `renderItemAccessory`) offers Add to calendar (opens `CalendarEventForm` in a dialog, posts a kitchen event) and Delete (confirmation dialog).
- Completed items sort by `completedAt`, newest first, under `CheckListBase`'s day headers.
