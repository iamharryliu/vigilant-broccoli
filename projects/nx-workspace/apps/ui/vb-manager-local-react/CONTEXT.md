# Agent Context — vb-manager-local-react

## Table of Contents

- [Nuances](#nuances)
  - [A failed kanban board fetch used to look like a brand-new account](#a-failed-kanban-board-fetch-used-to-look-like-a-brand-new-account)
  - [Kanban's cross-lane drag reads CheckList's internal dnd-kit payload](#kanbans-cross-lane-drag-reads-checklists-internal-dnd-kit-payload)

## Nuances

Non-obvious traps in this directory — read the relevant entry **before**
working on the surface it names, not only when something breaks.
[nuance-pattern.md](../../../../../docs/nuance-pattern.md) is the convention.

### A failed kanban board fetch used to look like a brand-new account

The kanban board (`src/app/components/kanban.component.tsx`, `useBoards`)
persists boards to MongoDB per `userEmail` (`vb-manager-local-fastify`'s
`src/routes/kanban/db.ts`). `fetchKanbanState` used to return `null` for
_any_ non-OK HTTP response from `GET /api/kanban/boards` — collapsing a real
error (an expired/invalid auth token, a transient failure in
`getUserEmail`'s `supabase.auth.getUser(token)` call, a Mongo connection
blip) into the exact same value as "this user has never saved a board."

`hydrate()` treated that value as license to fall through its full
first-time-user path: check `localStorage` (empty, since existing users'
local boards were already migrated and cleared), find nothing, then create a
default empty board and immediately `PUT` it — upserting over the real saved
document. One transient GET failure was enough to permanently wipe a user's
boards on the very next write, with no merge or backup: `saveKanbanState`
does a plain `$set` upsert.

Fixed by making `fetchKanbanState` return a tagged result
(`{ ok: true, state } | { ok: false }`) so `hydrate()` can bail out on a
failed fetch without ever reaching the default-board-creation/persist path.
Any other client-side hydration flow that falls back to "create and save a
default" needs to make the same distinction between a failed load and a
confirmed-empty one.

### Kanban's cross-lane drag reads CheckList's internal dnd-kit payload

`kanban.component.tsx` wraps one `GoogleTasksComponent` per lane (each with
`disableInternalDndContext`) in its own top-level `DndContext`, and its own
handlers (`handleDragStart`/`handleDragOver`/`handleTaskDragEnd`,
`TaskDragOverlay`) read the raw, untyped dnd-kit drag payload directly:
`active.data.current?.type === 'task'`, `.task`, `.taskListId`, and a
droppable `type: 'taskList'`. That payload isn't part of any component's
TypeScript props — it's set internally by
`@vigilant-broccoli/react-lib`'s `CheckList` (`CheckListRow`'s `useSortable`
and `CheckList`'s own `useDroppable` calls in
`libs/@vigilant-broccoli/react-lib/src/components/CheckList.tsx`), which
`GoogleTasksComponent` renders under the hood.

`CheckList` is otherwise fully generic (Google-Tasks-agnostic
`CheckListItem`/`listId` naming throughout its typed props), but this one
internal payload literal was deliberately left as `'task'`/`task`/
`'taskList'`/`taskListId` instead of being genericized, specifically so this
file's cross-lane handlers keep working unmodified. Renaming or restructuring
that payload inside `CheckList` will silently break drag-and-drop between
lanes here — there's no test coverage over it, so it fails only as "dragging
a task to another lane does nothing." Update this file's handlers in the same
change if that payload shape ever changes.
