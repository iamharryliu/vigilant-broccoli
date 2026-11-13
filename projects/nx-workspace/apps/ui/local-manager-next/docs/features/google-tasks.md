# Google Tasks

## Overview

- Standalone task list component for quick task management
- Requires Google OAuth session
- API routes resolve the Google access token server-side from the stored refresh token (`libs/google-token.ts` over `@vigilant-broccoli/react-lib-auth/google-token-server`); the client holds no Google token, and a missing or revoked token shows the Reconnect Google card
- The `/api/tasks/**` handlers come from `createGoogleTasksRouteHandlers` in `@vigilant-broccoli/react-lib-higher-level/google-tasks-server`, shared with mobile-manager-next; each app only supplies its token resolver in `libs/google-tasks-routes.ts`

## Task Creation

- Single task or multiple via `*item1 > item2 > item3` syntax
- Voice input — records audio, transcribes, then AI parses into a list of tasks

## Task Management

- Mark complete/incomplete, delete, drag-to-reorder
- Real-time sync with Google Tasks API

## Sorting Modes

- **Default** — Google Tasks list order
- **Eisenhower Matrix** — groups by priority quadrant (Q1–Q4)
- **Commit Type** — groups by commit type prefix (`feat:`, `fix:`, etc.)
