# CLAUDE — vb-manager-next-mobile

## Table of Contents

- [Nuances](#nuances)
  - [`vb-manager-next-mobile` ran the shell and the Google task list on two different sessions](#vb-manager-next-mobile-ran-the-shell-and-the-google-task-list-on-two-different-sessions)
  - [Sticky headings punch holes in a mobile overlay scrollbar](#sticky-headings-punch-holes-in-a-mobile-overlay-scrollbar)

## Nuances

Non-obvious traps in this directory — read the relevant entry **before**
working on the surface it names, not only when something breaks.
[nuance-pattern.md](../../../../docs/nuance-pattern.md) is the convention.

### `vb-manager-next-mobile` ran the shell and the Google task list on two different sessions

The mobile app has two independent credentials, not one login: the Supabase
session (owned by the Supabase JS client, `localStorage`, auto-refreshed for as
long as the refresh token lives) and the Google `provider_token` captured once
at sign-in (no refresh, dead after ~1 hour). Its hand-rolled
`src/app/providers/auth-provider.tsx` predates the shared
`createSupabaseAuth` module and diverged from it in two ways that made the
split visible as "the task list is logged in but the shell isn't", or the
reverse:

- The Google token was stored in `sessionStorage` while the Supabase session
  sits in `localStorage`. Closing the PWA/tab dropped the Google token but kept
  the Supabase session, so the app reopened "signed in" with every
  Google-backed page instantly broken.
- `signOutDueToExpiredToken` was a plain alias for `signOut`, so any 401 from a
  Google-backed route (`tasks-input`, `calendar-input`, `my-calendar-view`)
  tore down the whole Supabase session — the exact failure the
  [supabase auth pattern](../../../../docs/ui/auth/supabase-auth-pattern.md) warns about, and
  why the session looked ~1 hour long. Meanwhile `/task-list` renders
  `GoogleTasksComponent` from `react-lib`, which does the right thing (clear
  only the Google token, prompt re-consent), so the two surfaces behaved
  differently on the same expiry.

Both are now aligned with `react-lib`: the Google token lives in
`localStorage`, and `reconnectGoogle` clears only that token before
re-requesting consent. Any other hand-rolled copy of this provider (e.g.
`employee-handler-ui`) still needs the same treatment.

### Sticky headings punch holes in a mobile overlay scrollbar

`vb-manager-next-mobile`'s phone agenda (`src/app/components/my-calendar-view.tsx`)
used to be its own scroll container (`overflow-y-auto`) with one
`position: sticky` date heading per day group. On phones the scrollbar is an
_overlay_ scrollbar — it is painted over the content inside the scroller's own
box rather than in a reserved gutter. Chromium paints positioned/composited
descendants of a scroller above that overlay layer, so every sticky heading
(not just the one currently stuck) erased the slice of the thumb sitting behind
it. The result looked like the scrollbar itself was dashed: one gap per day
group, visible only while scrolling, and impossible to explain from the CSS of
the scrollbar because nothing in the repo styles scrollbars at all.

The fix is structural, not cosmetic: the phone agenda no longer scrolls itself.
The page grows (`PAGE_HEIGHT_MOBILE_SCROLL` in
`src/app/components/app-shell.constants.ts`) and the document scrolls, which
moves the overlay scrollbar out to the viewport edge — outside the card, so no
sticky heading can overlap it. The headings keep sticking, now against the
document, which is why their offset is `top-[var(--topbar-h)]` (clearing the
fixed topbar) instead of `top-0`.

Any other phone surface that combines a nested `overflow-y-auto` with sticky
section headers will reproduce this. Prefer letting the page scroll.
