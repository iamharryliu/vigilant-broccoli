# Checklist

Shared checklist behind the grocery list and kitchen chores pages (`src/app/components/Checklist.tsx`).

## Features

- Renders `CheckListBase` from `@vigilant-broccoli/react-lib` with dense separated rows, an `input` editor and large text; completed items are read-only and listed under a collapsible `Completed (n)` section.
- A thin adapter maps the hearth `ChecklistItem` (`name`, `completed`, `completedAt`) to the generic base item; fetching, optimistic add/toggle/rename/delete and auth/home providers stay in the component.
- Each row's `⋮` menu (passed via `renderItemAccessory`) offers Add to calendar (opens `CalendarEventForm` in a dialog, posts a kitchen event) and Delete (confirmation dialog).
- New items are added at the top of the active list; completed items sort by `completedAt`, newest first.
