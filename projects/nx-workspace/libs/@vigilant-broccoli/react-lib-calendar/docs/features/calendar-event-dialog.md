# Calendar Event Dialog

## Responsive Layout

- `CreateCalendarEventDialog` shares mobile-manager’s event creation flow with local-manager: full screen on phones and a centered dialog up to 600px wide on desktop.
- The header and Extract events footer stay visible while input and drafts scroll; desktop opens with the textarea focused, while phones keep the keyboard closed until requested.
- A ghost X icon closes the dialog; the header and footer have no divider lines.

## Event Creation

- Text, links, pasted images, gallery uploads and camera capture produce editable event drafts for explicit confirmation before creation.
- Callers provide authenticated requests, an optional Google reconnection handler and an optional voice action; credentials and voice recording remain app-owned.
- English copy uses the shared i18n mechanism; created drafts link to Google Calendar.
