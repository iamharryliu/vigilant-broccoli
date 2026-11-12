# CheckList

Layered checklist components in `libs/@vigilant-broccoli/react-lib`.

## Layers

- `CheckListBase` — purely presentational: no dnd-kit. Splits items into active rows and a collapsible `Completed (n)` section (`CollapsibleList`, open state persisted under `storageKeyPrefix` + `completedSectionId`). Completed rows sort by `completedAt ?? updatedAt`, newest first, grouped inside that section under headers for the timestamp's local day ("Today", "Yesterday", else e.g. "Mon, Nov 3", with the year outside the current one; `groupCompletedByDay` in `checklist-groups.utils.ts`). Rows without a timestamp follow in a final unlabelled group, so a consumer passing neither field gets no headers. A row leaving Completed keeps its day group while it collapses. Owns the slide-in and completion transitions; see [checklist-completion.md](./checklist-completion.md) for their consumer contract.
- `CheckList` — `CheckListBase` plus dnd-kit sorting, the `taskList` droppable, a drag-over placeholder, and per-item `notes`/`due`.

## CheckListBase

- Generic over `CheckListBaseItem` (`id`, `title`, `checked`, optional `completedAt`, `updatedAt`, `isNew`, `isRemoving`, `transitionFromId`); all state is controlled by the caller (`editingItemId`, `editingItemTitle`, `onToggleCheck`, `onStartEdit`, `onEditChange`, `onSaveEdit`, `onCancelEdit`).
- `editor` — `'textarea'` (default, Enter saves, Shift+Enter newline) or `'input'`; Escape cancels, blur saves.
- Editable titles render as buttons so keyboard users can start editing; each checkbox is labeled with its item's title.
- `rowVariant` — `'card'` (default, hover highlight) or `'dense'` (centered rows with divider lines); `size` sets the title's text size; `editCompleted={false}` makes completed titles read-only.
- Slots: `renderItemAccessory` (trailing), `renderItemMeta`/`renderItemDetails` (under the title), `itemClassName`, `emptyLabel` (rendered as given when no active rows).
- Extension points used by `CheckList`: `rowFrame` replaces each row's outer element, `wrapActiveItems` wraps the active rows, `activeFooter` follows them.

## Compatibility

- `CheckList` keeps its props, `CheckListItem` type, localStorage keys and the dnd payload (`type: 'task'`, `task`, `taskListId`; droppable `type: 'taskList'`) read by `apps/ui/local-manager-next`'s kanban handlers. See that app's `CONTEXT.md` before changing them.
- Consumers: `TaskChecklist`, `GoogleTasks`, the component-library `CheckListDemo`, `react-lib-higher-level`'s checklist viewer and hearth's tasks and checklists (`CheckList`).

## Standard behavior

- New items render at the top of the active list: prepend optimistic and saved rows, and store a position below the current minimum so a reload keeps them first.
- Every list is reorderable. Standalone consumers pass `onReorder` (receives the active ids in their new order; `CheckList` supplies its own `DndContext` and drag handles) and persist it, rolling back on failure. Consumers that already own a `DndContext` (kanban, hearth) pass `enableDragDrop` and handle `onDragEnd` instead.
- Adopted by job-hunt's Tasks page (`onReorder`), hearth's `TaskList`, `Checklist` and leisure list (POST routes insert at the minimum position minus one; they reorder via their own `DndContext`), `GoogleTasks` (Google inserts new tasks first; reorder via `tasks.move`, only in the Default sort mode, since other sorts hide the stored order) and the component-library `CheckListDemo`. `TaskChecklist` is only the sorting/view hook behind `GoogleTasks`; the mobile Google Tasks view wraps `GoogleTasks`.
