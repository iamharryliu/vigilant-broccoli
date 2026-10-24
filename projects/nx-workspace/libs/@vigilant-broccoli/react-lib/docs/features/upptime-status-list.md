# Upptime Status List

- Renders any Upptime repository's `history/summary.json` as a service list: status dot, 30-day UTC downtime strip, 24h/7d/30d/1y uptime and response time.

## Usage

- Fetch with `useUpptimeSummary(toUpptimeSummaryUrl(owner, repo))` and pass the result to `<UpptimeStatusList summary={summary} />`. The hook also returns `lastModified` for an "updated" line the caller renders.
- `groups` is optional; without it the list is flat and unheaded. Groups render in array order, a service joins the first group whose `match` returns true, and a group without `match` collects the rest. `showLegend` adds the legend dialog button to a group heading.
- `labels` overrides the English defaults (`DEFAULT_UPPTIME_STATUS_LIST_LABELS`); interpolated strings are functions, so callers can pass their translator.
- Page chrome, links to the Upptime site and workflow badges stay with the caller. `pages-index` `StatusPage` is the reference consumer.

## Constraints

- Styling is Tailwind classes. A consumer must include this package's source or published files in its Tailwind content paths, or the classes are purged and the list renders unstyled.
- Keep owner/repo URLs out of the lib; callers supply them.
