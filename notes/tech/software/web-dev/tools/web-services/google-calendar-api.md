# Google Calendar API

- [API Reference](https://developers.google.com/calendar/api/v3/reference)
- Used two ways in `vb-manager-next`: per-user OAuth for reading the signed-in user's own calendars, and a dedicated service account (`google_calendar_manager` in `infrastructure/terraform/main.tf`, key synced to Vault as `GOOGLE_CALENDAR_SA_CREDENTIALS`) that owns the scraped event calendars managed on the Event Calendars page.
- A service account can own and manage its own calendars without domain-wide delegation — it just needs the Calendar API enabled on the project and to share the calendar back to a personal account via `calendar.acl.insert`.

## Free Tier

- No billing tied to the Calendar API itself — it's free regardless of usage tier.
- Default quota: 1,000,000 queries/day per project, 500 queries per 100 seconds per user. Both are far above what a personal automation script needs and are adjustable in the Cloud Console if ever hit.
