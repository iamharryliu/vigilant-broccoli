# Agent Context — vb-manager-local-react

## Table of Contents

- [Nuances](#nuances)
  - [A failed kanban board fetch used to look like a brand-new account](#a-failed-kanban-board-fetch-used-to-look-like-a-brand-new-account)
  - [Kanban's cross-lane drag reads CheckList's internal dnd-kit payload](#kanbans-cross-lane-drag-reads-checklists-internal-dnd-kit-payload)

- Keyboard shortcuts cheatsheet (Settings page, see [docs/features/settings.md](./docs/features/settings.md)): when adding, changing, or removing a global keyboard shortcut in `src/app/layouts/main.layout.tsx` (`processKeyboardInput`), update `KEYBOARD_SHORTCUTS_MARKDOWN` in `src/app/content/keyboard-shortcuts.md.ts` to match.

## Nuances

### A failed kanban board fetch used to look like a brand-new account

Keep failed loads distinct from confirmed-empty state in `kanban.component.tsx`: `fetchKanbanState` returns `{ ok: false }` on failure and hydration exits. Falling through to default-board creation would immediately upsert over the user's saved MongoDB boards. The same distinction is necessary in any new hydration flow that saves defaults.

### Kanban's cross-lane drag reads CheckList's internal dnd-kit payload

`kanban.component.tsx` owns the `DndContext` around lanes using `GoogleTasksComponent` with `disableInternalDndContext`. Its handlers and `TaskDragOverlay` read CheckList's untyped payload: `type: 'task'`, `task`, `taskListId`, and droppable `type: 'taskList'`.

Despite CheckList's generic typed props, these literals remain task-specific for this consumer. If changing `libs/@vigilant-broccoli/react-lib/src/components/CheckList.tsx`'s payload, update the kanban handlers together; TypeScript does not check this coupling.
