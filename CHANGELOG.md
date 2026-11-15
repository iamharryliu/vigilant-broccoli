# Changelog

Generated weekly by `cron-agentic-pr-create-changelog` from merged pull requests. Review entries in the PR; never edit the markers.

<!-- changelog-through: acbdb805a10d6e5679c56e24694130971e1f2d4e -->
<!-- changelog-entries -->

## 2026-11-15

### hearth

- New checklist, leisure and task items go to the top of their lists, and reordering still works ([#1587](https://github.com/iamharryliu/vigilant-broccoli/pull/1587)).
- Lists refresh when the tab regains focus, so changes made on another device appear without a reload ([#1588](https://github.com/iamharryliu/vigilant-broccoli/pull/1588)).
- The recurring-task reset is replaced by Export and Import. Import matches tasks by title and never deletes anything. Deleting a recurring task now archives it, so its completed history stays ([#1591](https://github.com/iamharryliu/vigilant-broccoli/pull/1591)).
- Checklist rows share a standard ellipsis menu, and deleting a one-off task asks for confirmation ([#1607](https://github.com/iamharryliu/vigilant-broccoli/pull/1607)).
- Recipes respond to browser back and forward ([#1594](https://github.com/iamharryliu/vigilant-broccoli/pull/1594)).

### docs-md

- Long documents keep a sticky action bar with a title that fades in on scroll. The in-app back button retraces file navigation, and browser back and forward work too ([#1594](https://github.com/iamharryliu/vigilant-broccoli/pull/1594)).
- Several files can be selected at once, and the graph has settings for scope, hop count and forces ([#1594](https://github.com/iamharryliu/vigilant-broccoli/pull/1594)).

### context-md

- Browser back and forward switch between files ([#1594](https://github.com/iamharryliu/vigilant-broccoli/pull/1594)).

### grind-75-react

- Browser back and forward now move through the app's URL state ([#1594](https://github.com/iamharryliu/vigilant-broccoli/pull/1594)).

### pages-index

- New Changelog page lists these entries, linked from the home page ([#1586](https://github.com/iamharryliu/vigilant-broccoli/pull/1586)).
- New Private section after Demo lists owner-only apps, and Web Terminal moved there ([#1606](https://github.com/iamharryliu/vigilant-broccoli/pull/1606)).

### photography-react

- New public photo gallery at photography.harryliu.dev with an album grid, album pages and a lightbox viewer ([#1592](https://github.com/iamharryliu/vigilant-broccoli/pull/1592)).

### tasks-next

- New Google Tasks app at tasks.harryliu.dev, which the manager apps also embed. Sign-in from an embed opens a popup and hands the session back to the frame ([#1600](https://github.com/iamharryliu/vigilant-broccoli/pull/1600), [#1601](https://github.com/iamharryliu/vigilant-broccoli/pull/1601)).
- Only the manager apps can embed it, and their frames are sandboxed ([#1603](https://github.com/iamharryliu/vigilant-broccoli/pull/1603)).
- Embedded views fill their frame without padding or a card border ([#1610](https://github.com/iamharryliu/vigilant-broccoli/pull/1610)).
- Lists load every task: active ones first, then completed history in 30-day batches as you scroll ([#1609](https://github.com/iamharryliu/vigilant-broccoli/pull/1609)).
- The header shows the default list's real title instead of a loading skeleton ([#1608](https://github.com/iamharryliu/vigilant-broccoli/pull/1608)).
- Tasks can be deleted from a row's ellipsis menu ([#1607](https://github.com/iamharryliu/vigilant-broccoli/pull/1607)).
- Self-hosting is supported through a published Docker image, with Supabase and framing settings read at runtime ([#1605](https://github.com/iamharryliu/vigilant-broccoli/pull/1605)).

### react-lib

- Checklist rows support drag reorder and a standard ellipsis menu with confirmed delete ([#1587](https://github.com/iamharryliu/vigilant-broccoli/pull/1587), [#1607](https://github.com/iamharryliu/vigilant-broccoli/pull/1607)).
- `FileExplorer` is no longer exported. It moved to its own library, so the next release drops it from react-lib ([#1596](https://github.com/iamharryliu/vigilant-broccoli/pull/1596)).

### job-hunt-next

- Tasks: new items go to the top and can be dragged to reorder ([#1587](https://github.com/iamharryliu/vigilant-broccoli/pull/1587)).
- Tasks refresh when the tab regains focus ([#1588](https://github.com/iamharryliu/vigilant-broccoli/pull/1588)).
- Deleting a task asks for confirmation, and delete is hidden in demo mode ([#1607](https://github.com/iamharryliu/vigilant-broccoli/pull/1607)).

### local-manager-next

- CMS: upload a whole folder, and delete a folder from its context menu after confirming ([#1593](https://github.com/iamharryliu/vigilant-broccoli/pull/1593)).
- The home Tasks card embeds tasks.harryliu.dev in place of the native list ([#1600](https://github.com/iamharryliu/vigilant-broccoli/pull/1600), [#1601](https://github.com/iamharryliu/vigilant-broccoli/pull/1601)).
- Kanban and to-do lists delete through the standard ellipsis menu ([#1607](https://github.com/iamharryliu/vigilant-broccoli/pull/1607)).

### mobile-manager-next

- New Language tab on the home screen shows a random everyday word in English, Swedish, French, Spanish and Chinese, with speech, synonyms, an opposite word and example sentences ([#1616](https://github.com/iamharryliu/vigilant-broccoli/pull/1616)).
- Instagram appears in the Leisure apps ([#1598](https://github.com/iamharryliu/vigilant-broccoli/pull/1598)).
- The Tasks tab embeds tasks.harryliu.dev inside a matching border. Voice input, AI task creation and the bottom-sheet create dialog are gone from it ([#1602](https://github.com/iamharryliu/vigilant-broccoli/pull/1602), [#1612](https://github.com/iamharryliu/vigilant-broccoli/pull/1612)).
