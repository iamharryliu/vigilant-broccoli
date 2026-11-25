# Agent Context — react-lib-tasks

## Table of Contents

- [Nuances](#nuances)
  - [A failed kanban board fetch must not look like a brand-new account](#a-failed-kanban-board-fetch-must-not-look-like-a-brand-new-account)
  - [Kanban's cross-lane drag reads CheckList's internal dnd-kit payload](#kanbans-cross-lane-drag-reads-checklists-internal-dnd-kit-payload)

## Nuances

### A failed kanban board fetch must not look like a brand-new account

Keep failed loads distinct from confirmed-empty state in `KanbanBoards` (`src/lib/kanban/KanbanBoards.tsx`): a store's `load` returns `{ ok: false }` on failure and hydration exits. Falling through to default-board creation would immediately upsert over the user's saved boards. The same distinction is necessary in any new hydration flow that saves defaults.

### Kanban's cross-lane drag reads CheckList's internal dnd-kit payload

`KanbanBoards` owns the `DndContext` around lanes using `GoogleTasksComponent` with `disableInternalDndContext`. Its handlers and `TaskDragOverlay` read CheckList's untyped payload: `type: 'task'`, `task`, `taskListId`, and droppable `type: 'taskList'`.

Despite CheckList's generic typed props, these literals remain task-specific for this consumer. If changing `react-lib-checklist/src/lib/CheckList.tsx`'s payload, update the kanban handlers together; TypeScript does not check this coupling.
