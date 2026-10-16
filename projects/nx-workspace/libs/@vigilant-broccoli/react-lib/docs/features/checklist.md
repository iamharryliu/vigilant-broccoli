# CheckList

Layered checklist components in `libs/@vigilant-broccoli/react-lib`.

## Layers

- `CheckListBase` — purely presentational: no dnd-kit. Splits items into active rows and a collapsible `Completed (n)` section (`CollapsibleList`, open state persisted under `storageKeyPrefix` + `completedSectionId`). Completed rows sort by `completedAt ?? updatedAt`, newest first.
- `CheckList` — `CheckListBase` plus dnd-kit sorting, the `taskList` droppable, a drag-over placeholder, the slide-in animation, and per-item `notes`/`due`.

## CheckListBase

- Generic over `CheckListBaseItem` (`id`, `title`, `checked`, optional `completedAt`, `updatedAt`, `isNew`, `isRemoving`); all state is controlled by the caller (`editingItemId`, `editingItemTitle`, `onToggleCheck`, `onStartEdit`, `onEditChange`, `onSaveEdit`, `onCancelEdit`).
- `editor` — `'textarea'` (default, Enter saves, Shift+Enter newline) or `'input'`; Escape cancels, blur saves.
- `rowVariant` — `'card'` (default, hover highlight) or `'dense'` (centered rows with divider lines); `size` sets the title's text size; `editCompleted={false}` makes completed titles read-only.
- Slots: `renderItemAccessory` (trailing), `renderItemMeta`/`renderItemDetails` (under the title), `itemClassName`, `emptyLabel` (rendered as given when no active rows).
- Extension points used by `CheckList`: `rowFrame` replaces each row's outer element, `wrapActiveItems` wraps the active rows, `activeFooter` follows them.

## Compatibility

- `CheckList` keeps its props, `CheckListItem` type, localStorage keys and the dnd payload (`type: 'task'`, `task`, `taskListId`; droppable `type: 'taskList'`) read by `apps/ui/vb-manager-next`'s kanban handlers. See that app's `CONTEXT.md` before changing them.
- Consumers: `TaskChecklist`, `GoogleTasks`, the component-library `CheckListDemo`, `react-lib-higher-level`'s checklist viewer and hearth (`CheckListBase`).
