# Agent Context — hearth

- Export every kind of user-generated data. When a feature adds a Supabase table or browser-stored (localStorage) data that users create, add it to Export Data on `/settings` in the same change: a table goes in a group in `src/lib/export-groups.ts` (served by `/api/home-data/export`; nested rows via a `select` such as `'*, child(*)'`), a feature with its own format gets its own `/api/<key>/export` route plus an option in `EXPORT_OPTIONS`, and client-only data is exported in the page's `handleExport`. Dev-only data (seed or mock records) is excluded.
