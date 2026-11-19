# Sidebar groups

The sandbox sidebar nests one group per React lib, labelled with the lib name and ordered from low-level to high-level, under a single top-level `@vigilant-broccoli` group. Every item has an icon, so the desktop sidebar is an icon rail that expands on hover to `md:w-60` (content padding tracks it) so the longest lib and entry names fit. Each entry is served at `/<entry id>`; legacy `/#<entry id>` links are redirected to that path. A top-level "Components" item (`/`, also the fallback for unknown paths) opens an overview listing every entry in a three-column grid, sectioned by scoped package name (`@vigilant-broccoli/<lib>`) in sidebar order. Each section heading links to `/#vigilant-broccoli-<lib>`; the prefix keeps section ids from matching entry ids such as `docs-explorer`.

## Groups

| Group | Entries |
| --- | --- |
| `react-lib` | Foundational controls and surfaces: alert dialog, avatars, badge, button list, buttons, callout, card, checkbox, checklist, clearable input, collapsible list, context menu, copy pastable, delete confirmation dialog, dialog, download button, dropdown menu, ellipsis menu, embed dialog, error handling, highlight match, icon button, image crop dialog, input, keyboard accessory toolbar, link card, multi select, notepad, popover, progress, scroll area, scroll timeline, search input, segmented control, select, skeleton, speech-to-text toggle, stacked images, status card list, switch, tabs, team avatar, textarea, theme preference control, toaster, toggle group, tooltip, Upptime status list (sample data). Typography is a react-lib entry but sits as a top-level sidebar item above Components, and is left out of the react-lib group and the overview. |
| `react-lib-higher-level` | Chat panel (local messages), Mobile Home, preview deployments, security news list (sample data) and weather embed card. |
| `entry-directory` | Entry directory. |
| `sidebar` | Sidebar, described only: the sandbox's own left navigation is the live component. |
| `react-lib-quick-links` | Quick links dialog and panel. |
| `docs-explorer` | Docs explorer, plus the docs viewer and graph view over an in-memory sample tree. |
| `file-explorer` | File explorer over an in-memory sample tree served through a stub `fetcher`. |
| `chatbot` | Chat messages area, chat input area, chat history sidebar and confirm delete dialog, with sample chats. |
| `react-lib-calendar` | Calendar list view and its loading skeleton, event details and the create-event dialog (a stub `authFetch` parses any text into one sample event), with sample events. |
| `react-lib-crud-list` | CRUD lists with and without images. |
| `react-lib-tasks` | Tasks against an in-memory tasks API. |
| `react-lib-auth` | Google sign-in page with a stubbed handler; `createSupabaseAuth` is never called. |
| `react-lib-media` | Audio button, GitHub Actions badges, image filmstrip and carousel dialog (local placeholder images). |
| `leaderboard` | Empty, group and user leaderboards. |
| `react-music-lib` | Metronome. |
| `react-utility` | Alarm, calculator, cooking conversions, currency converter, QR reader (upload only), stopwatch, timer and weather clock card. |

## Assignment rules

- An entry belongs to the lib exporting the component it mainly showcases (check the demo's imports). Ids never change, so stored selections survive regrouping.
- Mobile Home sits under `react-lib-higher-level`, which owns its `TabbedView` shell; its `CalendarAgenda` comes from `react-lib-calendar`.
- Docs Explorer sits under `docs-explorer`, which exports `DocsExplorer`. The demo itself lives only in react-sandbox (a link to docs.harryliu.dev), so it is the closest-lib choice.
- Notepad sits under `react-lib` (`SyncedTextEditor`); Tasks sits under `react-lib-tasks` and Quick Links under `react-lib-quick-links`.
- Adding a lib means adding it to `LIB` (declaration order is sidebar order) with a distinct lucide icon in `LIB_ICON`, and its source glob to the component-library `tailwind.config.js`.
