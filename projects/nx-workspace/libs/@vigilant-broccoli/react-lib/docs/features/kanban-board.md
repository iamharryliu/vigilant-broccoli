# Kanban Board

## Overview

- `KanbanBoard` in `react-lib`: presentational swimlane board with dnd-kit drag and drop; demo in the component library (`Kanban Board`)
- Stateless: the caller owns `cards` and applies each reported move

## Contract

- `lanes`: `{ id, title }[]`; `cards`: `{ id, laneId, ... }[]`, ordered per lane by array order
- `onMoveCard({ cardId, fromLaneId, toLaneId, toIndex })`: `toIndex` is the position in the target lane before the card is removed from its source; no call for a drop in place
- `renderCard` draws card content (also used for the drag overlay); `renderLaneFooter` adds per-lane actions
- Dropping on an empty lane area appends to that lane

## Lane frame and reordering

- `onReorderLanes(laneIds)` on `KanbanBoard` makes lanes draggable by their grip handle; the board previews the new order while dragging and reports it on drop
- `KanbanLaneFrame`: the lane shell (`header`, `footer`, `isOver` drop ring, forwarded ref and `className`)
- `KanbanSortableLane` + `useKanbanLaneReorder`: the sortable lane and its live-reorder state, for boards that own their `DndContext`. Forward the context's `onDragStart`/`onDragOver`/`onDragEnd`/`onDragCancel` to the hook (each returns whether it was a lane drag) and render its `lanes`
- react-lib-tasks' `KanbanBoards` uses these for lanes; task cards and sidebar boards stay its own, since cards are CheckList rows
