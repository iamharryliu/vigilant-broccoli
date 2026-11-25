# Task search

A ghost search icon opens a `SearchDialog` (react-lib) that fuzzy-matches task titles. It sits left of the sort select in the list view and at the right of the board header in the board view (`libs/react-lib-tasks/src/lib/task-search.tsx`).

- **Scope:** the list view searches the active tasks of every task list and switches to the list holding the pick. The board view searches the active tasks of every list that has a lane on any board (lists without a lane have nowhere to show) and switches to the board holding the pick, preferring the current one. Completed tasks and notes are not searched.
- **Selecting:** the dialog closes, then `focusTaskRow` polls for the row (`data-checklist-item-id`, set by `CheckList`), scrolls it into view and outlines it briefly. The poll covers the list or board switch and the task fetch that follow.
- **Freshness:** tasks are fetched through the active mode's `/api/tasks` route (one request per list) each time the dialog opens.
- **Lanes:** a lane no longer renders its own title row. Its embedded task list passes `enableSearch={false}` and takes the grip, drag listeners (on the whole title region) and remove button through `titleProps`, `headerLeading` and `headerActions`; the board header's search replaces the per-list one.
