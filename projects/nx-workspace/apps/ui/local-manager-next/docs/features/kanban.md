# Kanban Board

## Overview

- The Kanban page frames tasks-next's `/embed/board?session=parent` (`tasks-kanban-frame.component.tsx`), full-bleed; `NEXT_PUBLIC_TASKS_URL` points it at another instance
- The frame borrows this app's Supabase session through `useEmbedSessionProvider`, so there is no second sign-in; its sign-in button runs this app's Google sign-in. See [tasks-next Embed](../../../tasks-next/docs/features/embed.md#parent-session)
- Board UI, drag behavior and the Google Tasks lanes live in `KanbanBoards`; see [tasks-next Board view](../../../tasks-next/docs/features/board-view.md)

## State

- Boards, lane order, active board and per-list sort modes are the `google` row of Supabase `app_kanban_boards` (one row per user email and store), written by tasks-next's `/api/kanban/boards`
- This app has no board route of its own; `supabase/migrations/20261125000200_ensure_app_kanban_boards.sql` only ensures the shared table exists
- Last-write-wins: each change overwrites the whole user row, so two open tabs or apps overwrite each other's boards
- The earlier MongoDB `kanban_boards` copy and `localStorage` boards are no longer read

## Constraints

- Requires a signed-in manager session; the frame shows tasks-next's sign-in prompt otherwise
- The tasks-next production deployment must serve `/embed/board` and list this app's origin in `TASKS_FRAME_ANCESTORS`

## Reference

- [Google Tasks](./google-tasks.md) — the home page's task card, which frames tasks-next's `/embed`
