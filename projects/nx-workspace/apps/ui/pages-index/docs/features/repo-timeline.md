# Repo Timeline

`/repo-timeline` — `RepoTimelinePage.tsx`, chart math in `consts/repoTimeline.ts`.

## Overview

- Two views: Graph (bar chart) and Timeline (scrollable list), toggled via `TIMELINE_VIEW`
- Metric selector (Lines/Commits/PRs) shared by both views
- View, range, granularity, and metric persist to `sessionStorage` for the tab (`useSessionState` in `RepoTimelinePage.tsx`), validated against each const's known values on read

## Graph View

- Range selector (`1W`/`1M`/`3M`/`6M`/`YTD`/`1Y`/`2Y`/`ALL`) replaces day/month/year granularity — graph is always day-bucketed
- Shows only the selected range's exact bucket count — no horizontal scroll-back
- `getGraphWindowSize` turns a range into a bucket count; `YTD` is calendar-relative (days since Jan 1)
- Y-axis scales to the visible window's `[min, max]` rather than always starting at 0, since cumulative metrics (running totals) cluster near their max once zoomed into a short range
- Bars are sized as a percentage (`w-4/5`) of their flex slot, not a fixed-pixel gap — a fixed gap multiplied by hundreds of buckets (2Y/ALL) can exceed the chart width and collapse every bar to 0px
- Hover shows a crosshair line + floating date/value label at the top; resets to the latest bucket on mouse leave
- X-axis label density is range-dependent: every day for `1W`, every 5th day for `1M`, month name for `3M`–`1Y`, year-only for `2Y`/`ALL`
- Each axis label also carries a `showOnMobile` flag — a sparser subset always renders, the rest only from the `sm:` breakpoint up

## Timeline View

- Granularity selector (Day/Month/Year) controls bucket size; no range selector here
- Entries list only periods with commits, newest first
- Line-change summary colors `+added` green and `−deleted` red (`ScrollTimelineEntry.sublabel` is a `ReactNode` to allow this)

## Gotchas

- `RepoScrollTimeline.tsx` pins `style={{ minHeight: 0 }}` on the Radix `Theme` wrapper — `.radix-themes` sets `min-height: 100%` and wins the cascade over the `min-h-0` Tailwind class, which otherwise lets the list grow past the viewport and get clipped
- `ScrollTimeline.tsx`'s active-row detection pins row 0 when `scrollTop <= 0` — on a tall container the fixed activation line can sit below row 0's midpoint, so nearest-line matching alone would never select it
