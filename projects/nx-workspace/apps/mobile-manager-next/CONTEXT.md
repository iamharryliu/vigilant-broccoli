# Agent Context — mobile-manager-next

## Table of Contents

- [Nuances](#nuances)
  - [`mobile-manager-next` ran the shell and the Google task list on two different sessions](#mobile-manager-next-ran-the-shell-and-the-google-task-list-on-two-different-sessions)
  - [The phone agenda's scrollbar must stay hidden](#the-phone-agendas-scrollbar-must-stay-hidden)

## Nuances

### `mobile-manager-next` ran the shell and the Google task list on two different sessions

The hand-written `src/app/providers/auth-provider.tsx` must follow the [Supabase auth pattern](../../../../docs/app-development/ui/auth/supabase-auth-pattern.md#client-side): persist the Google token in `localStorage` and reconnect Google without signing out of Supabase. The Google token expires independently; the Tasks tab (`/?tab=Tasks`) uses react-lib's auth handling, so provider drift makes the shell and task list disagree about login state.

### The phone agenda's scrollbar must stay hidden

The home page is pinned to the viewport (`PAGE_HEIGHT` with `overflow-hidden`), so the document never scrolls and each tab panel owns its scrolling; the phone agenda (`CalendarAgenda` from `react-lib-higher-level`, rendered by `home-view.tsx`) is its own `overflow-y-auto` container with sticky headings at `top-0`. Chromium paints sticky descendants above a nested scroller's mobile overlay scrollbar, leaving a gap in its thumb at each heading, so the agenda hides its scrollbar. Keep it hidden (or the headings opaque and isolated) when restyling the container, and keep every flex ancestor down to the panel at `min-h-0` or the agenda grows past the viewport instead of scrolling.
