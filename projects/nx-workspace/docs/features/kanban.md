# Kanban Board

## Overview

- Google Tasks-backed swimlane board in `vb-manager-next`
- Boards and lane order persisted in `localStorage`
- Requires Google OAuth session

## Data Model

- **Board** — named container with ordered lanes
- **Lane** — maps to a Google Tasks task list
- **Task** — individual Google Task item within a lane

## Features

### Boards

- Create, rename (double-click), delete boards
- Drag to reorder boards in sidebar
- Sidebar collapsible

### Lanes

- Add lane by selecting a Google Tasks list (each list usable once per board)
- Remove lanes
- Drag handle in header to reorder; reorder is tracked in local state during drag and committed on drop
- Dragging lane resolves target by `taskListId` since `over` may be a task item droppable inside the lane, not the lane itself

### Tasks

- Drag tasks between lanes (creates in target first, then deletes from source)
- Drag to reorder within same lane
- Lane highlights on hover when dragging a task

## State

- Board config: `localStorage` keys `swimlanes-boards`, `swimlanes-active-board`
- Task data: fetched from Google Tasks API via `/api/tasks`, `/api/tasks/lists`

## Constraints

- A task list can only appear once per board
- Requires authenticated session to load task lists
