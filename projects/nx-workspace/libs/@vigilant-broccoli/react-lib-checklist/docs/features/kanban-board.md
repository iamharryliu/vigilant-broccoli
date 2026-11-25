# Kanban Board

## Overview

- `KanbanBoard` in `react-lib-checklist`: presentational swimlane board with dnd-kit drag and drop; demo in the component library (`Kanban Board`)
- Stateless: the caller owns `cards` and applies each reported move

## Contract

- `lanes`: `{ id, title }[]`; `cards`: `{ id, laneId, ... }[]`, ordered per lane by array order
- `onMoveCard({ cardId, fromLaneId, toLaneId, toIndex })`: `toIndex` is the position in the target lane before the card is removed from its source; no call for a drop in place
- `renderLaneActions(lane)`: trailing header controls (search, remove); `renderLaneToolbar(lane)`: a row under the header (sort select). Both are slots: the board owns no sort, search or removal state
- `renderCard` draws card content (also used for the drag overlay); `renderLaneFooter` adds per-lane actions
- Dropping on an empty lane area appends to that lane

## Lane frame and reordering

- `onReorderLanes(laneIds)` on `KanbanBoard` makes lanes draggable by their grip handle; the board previews the new order while dragging and reports it on drop
- `KanbanLaneFrame`: the lane shell (`header`, `footer`, `isOver` drop ring, forwarded ref and `className`)
- `KanbanSortableLane` + `useKanbanLaneReorder`: the sortable lane and its live-reorder state, for boards that own their `DndContext`. Forward the context's `onDragStart`/`onDragOver`/`onDragEnd`/`onDragCancel` to the hook (each returns whether it was a lane drag) and render its `lanes`
- `KanbanLaneChrome`: `KanbanLaneHeader` (grip, title, actions, toolbar), `KanbanLaneRow` (the sortable lane row) and `KanbanLaneDragOverlay`, plus `KanbanAddLaneButton`. react-lib-tasks' `KanbanBoards` and `GoogleTasksComponent`'s header render through the same pieces, so lane UI changes land in one place
- Task cards and sidebar boards stay react-lib-tasks' own, since cards are CheckList rows

## Appearance

- Lane chrome matches react-lib-tasks: `w-80`, no panel, grip plus a size-5 bold title, a muted count
- `cardVariant="row"` drops the card border and puts a grip handle on the left (only the handle drags), like CheckList rows; the demo renders each card with `CheckListBase`
