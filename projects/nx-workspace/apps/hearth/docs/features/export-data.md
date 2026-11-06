# Export Data

`/settings` exports the selected home's data as JSON, one file per selected option.

- Table-backed data is grouped in `src/lib/export-groups.ts` and served by `/api/home-data/export?group=<key>&homeId=<id>`. Child rows (price entries, receipt items/taxes/images, doc files) are nested via the group's `select`.
- Where Is and Kitchen Planner keep their own `/api/<key>/export` routes and are the only options with an import route; Where Is exports image bytes.
- Tasks (recurring and one-off) live in localStorage and are exported client-side, so they come from the current browser.
- Receipt images and doc files export as metadata rows only; the files stay in R2.
- Dev-only seed data is not exported.
