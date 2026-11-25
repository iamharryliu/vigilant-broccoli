# Board view

The home header's view toggle (right of the storage select) switches between the single list and the kanban board, remembered in `localStorage` (`tasks-view-mode`, `libs/view-mode.ts`).

- **Shared board:** `KanbanBoards` from `react-lib-tasks` is the same component local-manager-next's Kanban page uses: a boards sidebar, lanes per task list (add, remove, drag to reorder), a Manage Task Lists dialog, per-list sort modes, the create-tasks dialog and drag of tasks within and across lanes. It reads and writes tasks through the active mode's adapter (`/api/tasks*`, or `/api/db-tasks*` in Database mode) and takes a `KanbanStore` for the board setup.
- **Board storage:** `libs/kanban-store.ts` picks the store by mode. Local keeps the boards in `localStorage` (`tasks-kanban-boards`). Google and Database both save to Supabase through `/api/kanban/boards?store=<mode>` (`app_kanban_boards`, one row per user and mode, since the two have different list ids; `supabase/migrations/20261125000100_create_app_kanban_boards.sql`). local-manager-next reads and writes the same `google` row through its own route, so its Kanban page and tasks-next's Google mode show the same boards.
- **Dragging:** a task dropped on another lane is created there, then deleted from the source, so only its title and notes carry over. The drag reads CheckList's untyped dnd-kit payload; see local-manager-next's `CONTEXT.md`.
- **Signed out:** the board needs a signed-in store (or Local), so a signed-out Google or Database view shows the list view's sign-in prompt instead.
