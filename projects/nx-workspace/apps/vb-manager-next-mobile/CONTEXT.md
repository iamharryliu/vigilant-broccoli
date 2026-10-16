# Agent Context — vb-manager-next-mobile

## Table of Contents

- [Nuances](#nuances)
  - [`vb-manager-next-mobile` ran the shell and the Google task list on two different sessions](#vb-manager-next-mobile-ran-the-shell-and-the-google-task-list-on-two-different-sessions)
  - [Sticky headings punch holes in a mobile overlay scrollbar](#sticky-headings-punch-holes-in-a-mobile-overlay-scrollbar)

## Nuances

### `vb-manager-next-mobile` ran the shell and the Google task list on two different sessions

The hand-written `src/app/providers/auth-provider.tsx` must follow the [Supabase auth pattern](../../../../docs/app-development/ui/auth/supabase-auth-pattern.md#client-side): persist the Google token in `localStorage` and reconnect Google without signing out of Supabase. The Google token expires independently; the Tasks tab (`/?tab=Tasks`) uses react-lib's auth handling, so provider drift makes the shell and task list disagree about login state.

### Sticky headings punch holes in a mobile overlay scrollbar

Chromium can paint sticky descendants above a nested scroller's mobile overlay scrollbar, leaving a gap in its thumb at each heading. Keep the phone agenda in `my-calendar-view.tsx` on document scrolling via `PAGE_HEIGHT_MOBILE_SCROLL`, with sticky headings at `top-[var(--topbar-h)]`. Restoring nested `overflow-y-auto` recreates the problem; use page scrolling for similar phone surfaces.
