# Sidebar groups

The sandbox sidebar has one group per `@vigilant-broccoli` React lib, labelled with the lib name and ordered from low-level to high-level. Each entry shows an "Import from" line naming its package.

## Groups

| Group                    | Entries                                                                                                                                                                                                                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react-lib`              | Foundational controls and surfaces: alert dialog, avatars, badge, buttons, card, checkbox, checklist, collapsible list, error handling, input, link card, notepad, scroll timeline, segmented control, select, status card list, switch, tabs, toaster, tooltip, typography. |
| `react-lib-higher-level` | CRUD lists, leaderboards, pastebin, quick links, tasks, docs explorer and Mobile Home.                                                                                                                                                                                       |
| `react-lib-calendar`     | Calendar list view and its loading skeleton, with sample events.                                                                                                                                                                                                             |
| `react-lib-auth`         | Google sign-in page with a stubbed handler; `createSupabaseAuth` is never called.                                                                                                                                                                                            |
| `react-lib-media`        | Audio button, GitHub Actions badges, image filmstrip and carousel dialog (local placeholder images).                                                                                                                                                                         |
| `react-music-lib`        | Metronome.                                                                                                                                                                                                                                                                   |
| `react-utility`          | Alarm, calculator, cooking conversions, currency converter, stopwatch, timer and weather clock card.                                                                                                                                                                         |

## Assignment rules

- An entry belongs to the lib exporting the component it mainly showcases (check the demo's imports). Ids never change, so stored selections survive regrouping.
- Mobile Home sits under `react-lib-higher-level`, which owns its `TabbedView` shell and `CalendarAgenda`.
- Docs Explorer sits under `react-lib-higher-level`, which exports `DocsExplorer`. The demo itself lives only in react-sandbox (screenshots plus the feature doc), so it is the closest-lib choice.
- Notepad sits under `react-lib` (`SyncedTextEditor`); Pastebin, Tasks and Quick Links sit under `react-lib-higher-level`.
- Adding a lib means adding it to `LIB` (declaration order is sidebar order) with a distinct lucide icon in `LIB_ICON`, and its source glob to the component-library `tailwind.config.js`.
