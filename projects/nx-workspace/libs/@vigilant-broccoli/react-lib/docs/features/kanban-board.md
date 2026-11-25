# Kanban Board

## Overview

- `KanbanBoard` in `react-lib`: presentational swimlane board with dnd-kit drag and drop; demo in the component library (`Kanban Board`)
- Stateless: the caller owns `cards` and applies each reported move

## Contract

- `lanes`: `{ id, title }[]`; `cards`: `{ id, laneId, ... }[]`, ordered per lane by array order
- `onMoveCard({ cardId, fromLaneId, toLaneId, toIndex })`: `toIndex` is the position in the target lane before the card is removed from its source; no call for a drop in place
- `renderCard` draws card content (also used for the drag overlay); `renderLaneFooter` adds per-lane actions
- Dropping on an empty lane area appends to that lane

## Lane frame

- `KanbanLaneFrame`: the lane shell (`header`, `footer`, `isOver` drop ring, forwarded ref and `className`) shared by `KanbanBoard` and react-lib-tasks' `KanbanBoards`, whose lanes keep their own sortable behavior and `CheckList` cards
