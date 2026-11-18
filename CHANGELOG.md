# Changelog

One collapsible section per month, newest first. Agentic pull requests add their own bullet when they change behavior, and `cron-agentic-pr-create-changelog` folds each week's merged pull requests into the current month, tidying those bullets and covering the rest; review entries in its PR and never edit the markers. Months before 2026-07 were reconstructed from commit history, from before work landed through pull requests.

<!-- changelog-through: acbdb805a10d6e5679c56e24694130971e1f2d4e -->
<!-- changelog-entries -->

<details>
<summary>November 2026</summary>

### dotfiles

- `localcleanup` also deletes local branches except main and any still checked out in a worktree, and its summary lists how many were deleted and kept. It now removes worktrees with uncommitted changes by default; `--keep-dirty` skips them ([#1656](https://github.com/iamharryliu/vigilant-broccoli/pull/1656)).
- `cheatsheet` and `pnpm cheatsheet` open an interactive picker: arrow keys browse header groups, typing filters every command, Enter runs the pick (asking for arguments first when it takes any), and Esc or Ctrl-C quits ([#1659](https://github.com/iamharryliu/vigilant-broccoli/pull/1659)).

### hearth

- New Whiteboard and Tasks tabs on the home page with recurring and one-off tasks stored per home, assignable to members, with each recurring occurrence its own instance and carried-over ones labeled missed ([#1485](https://github.com/iamharryliu/vigilant-broccoli/pull/1485), [#1493](https://github.com/iamharryliu/vigilant-broccoli/pull/1493), [#1495](https://github.com/iamharryliu/vigilant-broccoli/pull/1495), [#1508](https://github.com/iamharryliu/vigilant-broccoli/pull/1508), [#1561](https://github.com/iamharryliu/vigilant-broccoli/pull/1561)).
- New checklist, leisure and task items go to the top of their lists and can be dragged to reorder, and lists refresh when the tab regains focus ([#1387](https://github.com/iamharryliu/vigilant-broccoli/pull/1387), [#1486](https://github.com/iamharryliu/vigilant-broccoli/pull/1486), [#1587](https://github.com/iamharryliu/vigilant-broccoli/pull/1587), [#1588](https://github.com/iamharryliu/vigilant-broccoli/pull/1588)).
- The recurring-task reset is replaced by Export and Import. Import matches tasks by title and never deletes anything. Deleting a recurring task now archives it, so its completed history stays ([#1591](https://github.com/iamharryliu/vigilant-broccoli/pull/1591)).
- Tasks and checklist items animate as they are added, completed and reopened, with skeletons instead of misleading empty states while loading ([#1513](https://github.com/iamharryliu/vigilant-broccoli/pull/1513), [#1509](https://github.com/iamharryliu/vigilant-broccoli/pull/1509), [#1515](https://github.com/iamharryliu/vigilant-broccoli/pull/1515)).
- Owners and admins can share invite links through any chat app, and all user data can be exported from Settings ([#1548](https://github.com/iamharryliu/vigilant-broccoli/pull/1548), [#1490](https://github.com/iamharryliu/vigilant-broccoli/pull/1490)).
- Where Is separates Analyze from Save, makes photos optional and sorts tags alphabetically ([#1531](https://github.com/iamharryliu/vigilant-broccoli/pull/1531), [#1532](https://github.com/iamharryliu/vigilant-broccoli/pull/1532), [#1533](https://github.com/iamharryliu/vigilant-broccoli/pull/1533)).
- Checklist rows share a standard ellipsis menu, and deleting a one-off task asks for confirmation ([#1607](https://github.com/iamharryliu/vigilant-broccoli/pull/1607)).
- Content-heavy dialogs go full screen on phones, and recipes respond to browser back and forward ([#1498](https://github.com/iamharryliu/vigilant-broccoli/pull/1498), [#1594](https://github.com/iamharryliu/vigilant-broccoli/pull/1594)).

### tasks-next

- New Google Tasks app at tasks.harryliu.dev, which the manager apps also embed. Sign-in from an embed opens a popup and hands the session back to the frame ([#1600](https://github.com/iamharryliu/vigilant-broccoli/pull/1600), [#1601](https://github.com/iamharryliu/vigilant-broccoli/pull/1601)).
- Only the manager apps can embed it, and their frames are sandboxed ([#1603](https://github.com/iamharryliu/vigilant-broccoli/pull/1603)).
- Embedded views fill their frame without padding or a card border ([#1610](https://github.com/iamharryliu/vigilant-broccoli/pull/1610)).
- Lists load every task: active ones first, then completed history in 30-day batches as you scroll ([#1609](https://github.com/iamharryliu/vigilant-broccoli/pull/1609)).
- The header shows the default list's real title instead of a loading skeleton ([#1608](https://github.com/iamharryliu/vigilant-broccoli/pull/1608)).
- Tasks can be deleted from a row's ellipsis menu ([#1607](https://github.com/iamharryliu/vigilant-broccoli/pull/1607)).
- Self-hosting is supported through a published Docker image, with Supabase and framing settings read at runtime ([#1605](https://github.com/iamharryliu/vigilant-broccoli/pull/1605)).

### job-hunt-next

- Each application has a versioned résumé, previewable as a PDF, a versioned cover letter and a structured application brief ([#1439](https://github.com/iamharryliu/vigilant-broccoli/pull/1439), [#1447](https://github.com/iamharryliu/vigilant-broccoli/pull/1447), [#1450](https://github.com/iamharryliu/vigilant-broccoli/pull/1450), [#1451](https://github.com/iamharryliu/vigilant-broccoli/pull/1451)).
- Applications can be searched, marked as applied and colored by status, and runs execute concurrently in a capped queue ([#1462](https://github.com/iamharryliu/vigilant-broccoli/pull/1462), [#1501](https://github.com/iamharryliu/vigilant-broccoli/pull/1501), [#1430](https://github.com/iamharryliu/vigilant-broccoli/pull/1430)).
- New Notes, Tasks and Matches pages: Matches scores LinkedIn search results against career skills, with inline sort and filters ([#1577](https://github.com/iamharryliu/vigilant-broccoli/pull/1577), [#1579](https://github.com/iamharryliu/vigilant-broccoli/pull/1579), [#1584](https://github.com/iamharryliu/vigilant-broccoli/pull/1584)).
- Tasks: new items go to the top, can be dragged to reorder and refresh when the tab regains focus. Deleting a task asks for confirmation, and delete is hidden in demo mode ([#1587](https://github.com/iamharryliu/vigilant-broccoli/pull/1587), [#1588](https://github.com/iamharryliu/vigilant-broccoli/pull/1588), [#1607](https://github.com/iamharryliu/vigilant-broccoli/pull/1607)).

### grind-75-react

- New public app that shows each Grind 75 problem's Go, Python and TypeScript solutions side by side, as language tabs on mobile ([#1471](https://github.com/iamharryliu/vigilant-broccoli/pull/1471), [#1478](https://github.com/iamharryliu/vigilant-broccoli/pull/1478), [#1487](https://github.com/iamharryliu/vigilant-broccoli/pull/1487)).
- Browser back and forward now move through the app's URL state ([#1594](https://github.com/iamharryliu/vigilant-broccoli/pull/1594)).

### photography-react

- New public photo gallery at photography.harryliu.dev with an album grid, album pages and a lightbox viewer ([#1592](https://github.com/iamharryliu/vigilant-broccoli/pull/1592)).
- Albums and photos show in uncropped masonry columns with only cover images on the album list, and albums have real URLs like `/summer-trip`; old `#/` links still redirect ([#1658](https://github.com/iamharryliu/vigilant-broccoli/pull/1658)).

### pages-index

- New Changelog page lists these entries, linked from the home page ([#1586](https://github.com/iamharryliu/vigilant-broccoli/pull/1586)).
- New Private section after Demo lists owner-only apps, and Web Terminal moved there ([#1606](https://github.com/iamharryliu/vigilant-broccoli/pull/1606)).
- The Changelog page shows each month as a collapsible section titled like November 2026, newest open and animated as it toggles ([#1660](https://github.com/iamharryliu/vigilant-broccoli/pull/1660)).
- Games sit after Web Applications, and the Status page drops its updated-date line ([#1396](https://github.com/iamharryliu/vigilant-broccoli/pull/1396), [#1483](https://github.com/iamharryliu/vigilant-broccoli/pull/1483)).
- The Deployments page refreshes itself every 5 minutes while visible, so the Refresh button is gone. Each app has one Preview link with its commit and deploy age, and an empty list says whether there are no open pull requests or none have a preview yet ([#1663](https://github.com/iamharryliu/vigilant-broccoli/pull/1663)).

### docs-md

- Long documents keep a sticky action bar with a title that fades in on scroll. The in-app back button retraces file navigation, and browser back and forward work too ([#1594](https://github.com/iamharryliu/vigilant-broccoli/pull/1594)).
- Several files can be selected at once, and the graph has settings for scope, hop count and forces ([#1594](https://github.com/iamharryliu/vigilant-broccoli/pull/1594)).
- On desktop the sidebar slides away for full-width reading, from its panel icon or `f`. The graph opens from the content bar or `g` and shares its top bar and menu, whose items now have icons ([#1650](https://github.com/iamharryliu/vigilant-broccoli/pull/1650)).
- The graph opens without a top bar and stays open on the start page, keeps the open note centered and highlights it and hovered notes with soft glows. Its settings add color schemes from Sanzo Wada's _A Dictionary of Color Combinations_ (No. 321 by default) and a node glow switch, and it now defaults to 4 hops ([#1657](https://github.com/iamharryliu/vigilant-broccoli/pull/1657)).

### context-md

- Browser back and forward switch between files ([#1594](https://github.com/iamharryliu/vigilant-broccoli/pull/1594)).
- The sidebar can be hidden on desktop from its panel icon or `f` ([#1650](https://github.com/iamharryliu/vigilant-broccoli/pull/1650)).
- The graph keeps the open note centered, highlights it and hovered notes with soft glows, and adds color schemes from Sanzo Wada's _A Dictionary of Color Combinations_ (No. 321 by default) and a node glow switch to its settings ([#1657](https://github.com/iamharryliu/vigilant-broccoli/pull/1657)).

### bookmarks-react

- Bookmarks are managed in a dialog, with curated defaults and a Reset to default action ([#1437](https://github.com/iamharryliu/vigilant-broccoli/pull/1437)).
- The tabs, now Bookmarks, Manage Bookmarks and Settings with icons, sit at the top left. Settings picks System, Light or Dark, and Add, Export, Import, Clear all and Reset to default are icon buttons in one row that confirm in a dialog. The default list drops the repo's own links ([#1665](https://github.com/iamharryliu/vigilant-broccoli/pull/1665)).
- Manage Bookmarks has a search bar that filters bookmarks by label or link, and the page sits closer to the tabs with tighter spacing between the buttons and lists ([#1667](https://github.com/iamharryliu/vigilant-broccoli/pull/1667)).
- Bookmarks and its staging site moved to `bookmarks.vigilant-broccoli.app` and `staging-bookmarks.vigilant-broccoli.app` with no redirect from the `harryliu.dev` addresses. Saved bookmarks stay in the old address's browser storage, so Export them there and Import them on the new one ([#1666](https://github.com/iamharryliu/vigilant-broccoli/pull/1666)).
- The default list now includes the generic browser links from the local manager (dev vendor consoles, Google, Proton, AI tools, messaging, learning) and leaves out personal accounts and the repo's own apps ([#1668](https://github.com/iamharryliu/vigilant-broccoli/pull/1668)).

### weather-next

- The weather card is embedded in the local and mobile managers from one deployed source, and any site may frame it ([#1549](https://github.com/iamharryliu/vigilant-broccoli/pull/1549), [#1552](https://github.com/iamharryliu/vigilant-broccoli/pull/1552)).

### balloono

- Landscape handheld mode on mobile with a settings menu for mute, restart, CPU count and difficulty, and power-up levels in the HUD ([#1518](https://github.com/iamharryliu/vigilant-broccoli/pull/1518)).

### web-terminal

- The bar is a two-row grid so every key shows without scrolling, with the arrows laid out as on a keyboard and Esc at the top right, and the Claude PR skills moved to the Dev tab ([#1655](https://github.com/iamharryliu/vigilant-broccoli/pull/1655)).
- The mobile toolbar keeps the keys in use, with arrows and Tab on the bar, shortcut buttons for agent and Claude Code commands, and a full-screen All keys sheet ([#1481](https://github.com/iamharryliu/vigilant-broccoli/pull/1481), [#1484](https://github.com/iamharryliu/vigilant-broccoli/pull/1484), [#1502](https://github.com/iamharryliu/vigilant-broccoli/pull/1502), [#1504](https://github.com/iamharryliu/vigilant-broccoli/pull/1504), [#1505](https://github.com/iamharryliu/vigilant-broccoli/pull/1505), [#1507](https://github.com/iamharryliu/vigilant-broccoli/pull/1507)).

### react-lib

- Checklist rows support drag reorder, animated completion and a standard ellipsis menu with confirmed delete ([#1587](https://github.com/iamharryliu/vigilant-broccoli/pull/1587), [#1607](https://github.com/iamharryliu/vigilant-broccoli/pull/1607)).
- FileExplorer gained file previews, image thumbnails, multi-select, a right-click menu, keyboard navigation and a modal image and PDF viewer ([#1514](https://github.com/iamharryliu/vigilant-broccoli/pull/1514), [#1520](https://github.com/iamharryliu/vigilant-broccoli/pull/1520), [#1530](https://github.com/iamharryliu/vigilant-broccoli/pull/1530), [#1562](https://github.com/iamharryliu/vigilant-broccoli/pull/1562)).
- Notepad and whiteboard text persists with its Yjs state, so reloads and rejoins no longer lose edits ([#1503](https://github.com/iamharryliu/vigilant-broccoli/pull/1503)).
- Global shortcuts are ignored while typing or with a dialog open ([#1397](https://github.com/iamharryliu/vigilant-broccoli/pull/1397)).
- `FileExplorer` is no longer exported. It moved to its own library, so the next release drops it from react-lib ([#1596](https://github.com/iamharryliu/vigilant-broccoli/pull/1596)).
- `SegmentedControl` now matches `Tabs` (muted track with a sliding selection pill) and selects with the arrow keys, Home and End. The new `ToggleGroup` holds that shared look ([#1664](https://github.com/iamharryliu/vigilant-broccoli/pull/1664)).

### react-lib-media

- New `ImageGallery` shows a list of images with a call to action as masonry columns, justified rows or a shuffled stack you page through with the arrow keys, demoed in the component library ([#1658](https://github.com/iamharryliu/vigilant-broccoli/pull/1658)).

### chat

- New private chat app on Vercel: a chatbot with knowledge base search, spoken replies and voice input, sharing its UI and settings with local-manager-next ([#1567](https://github.com/iamharryliu/vigilant-broccoli/pull/1567), [#1568](https://github.com/iamharryliu/vigilant-broccoli/pull/1568), [#1570](https://github.com/iamharryliu/vigilant-broccoli/pull/1570), [#1572](https://github.com/iamharryliu/vigilant-broccoli/pull/1572), [#1573](https://github.com/iamharryliu/vigilant-broccoli/pull/1573)).

### local-manager-next

- New CMS page browses, previews, uploads to and deletes from Cloudflare R2, including whole folders ([#1512](https://github.com/iamharryliu/vigilant-broccoli/pull/1512), [#1593](https://github.com/iamharryliu/vigilant-broccoli/pull/1593)).
- The chatbot has a RAG knowledge base with drag-and-drop uploads, Markdown code blocks and confirmed chat deletion ([#1556](https://github.com/iamharryliu/vigilant-broccoli/pull/1556), [#1560](https://github.com/iamharryliu/vigilant-broccoli/pull/1560), [#1557](https://github.com/iamharryliu/vigilant-broccoli/pull/1557), [#1563](https://github.com/iamharryliu/vigilant-broccoli/pull/1563)).
- New file converter, connection world map, security news page, and iCal and web page event sources ([#1472](https://github.com/iamharryliu/vigilant-broccoli/pull/1472), [#1379](https://github.com/iamharryliu/vigilant-broccoli/pull/1379), [#1399](https://github.com/iamharryliu/vigilant-broccoli/pull/1399)).
- Cloud services, local services, text tools and music moved into their own apps ([#1429](https://github.com/iamharryliu/vigilant-broccoli/pull/1429), [#1529](https://github.com/iamharryliu/vigilant-broccoli/pull/1529)).
- The home Tasks card embeds tasks.harryliu.dev in place of the native list ([#1600](https://github.com/iamharryliu/vigilant-broccoli/pull/1600), [#1601](https://github.com/iamharryliu/vigilant-broccoli/pull/1601)).
- Kanban and to-do lists delete through the standard ellipsis menu ([#1607](https://github.com/iamharryliu/vigilant-broccoli/pull/1607)).

### mobile-manager-next

- New Language tab on the home screen shows a random everyday word in English, Swedish, French, Spanish and Chinese, with speech, synonyms, an opposite word and example sentences ([#1616](https://github.com/iamharryliu/vigilant-broccoli/pull/1616)).
- Instagram appears in the Leisure apps, and embed-flagged links open in an in-app page ([#1598](https://github.com/iamharryliu/vigilant-broccoli/pull/1598), [#1398](https://github.com/iamharryliu/vigilant-broccoli/pull/1398)).
- The Tasks tab embeds tasks.harryliu.dev inside a matching border. Voice input, AI task creation and the bottom-sheet create dialog are gone from it ([#1602](https://github.com/iamharryliu/vigilant-broccoli/pull/1602), [#1612](https://github.com/iamharryliu/vigilant-broccoli/pull/1612)).
- Google Tasks and Calendar stay connected past the hourly token expiry ([#1524](https://github.com/iamharryliu/vigilant-broccoli/pull/1524)).

### media-service

- New Fastify media service handles hearth's image processing ([#1383](https://github.com/iamharryliu/vigilant-broccoli/pull/1383)).

### socket-server-socketio

- New SSE transport with HTTP publishing for one-way consumers ([#1543](https://github.com/iamharryliu/vigilant-broccoli/pull/1543)).

</details>

<details>
<summary>October 2026</summary>

### pages-index

- projects.harryliu.dev now serves the pages index, with the status page at status.harryliu.dev and a public preview deployments page at deployments.harryliu.dev ([#823](https://github.com/iamharryliu/vigilant-broccoli/pull/823), [#940](https://github.com/iamharryliu/vigilant-broccoli/pull/940), [#1204](https://github.com/iamharryliu/vigilant-broccoli/pull/1204)).
- New app README pages and a browser for public GitHub repositories, with relative links and images pointing back to GitHub ([#1161](https://github.com/iamharryliu/vigilant-broccoli/pull/1161)).
- Status and uptime share one native list that matches dark mode, and repo timeline controls are shareable with per-day values and keyboard navigation ([#1001](https://github.com/iamharryliu/vigilant-broccoli/pull/1001), [#1218](https://github.com/iamharryliu/vigilant-broccoli/pull/1218)).
- Docker image cards come from a registry checked against pushed images, and a shared Games collection has its own hostname ([#1298](https://github.com/iamharryliu/vigilant-broccoli/pull/1298), [#1367](https://github.com/iamharryliu/vigilant-broccoli/pull/1367)).

### personal-website-react

- Email signature icons stay readable on dark backgrounds, the desktop navbar stays opaque on scroll, and a Career Summary badge links to career.harryliu.dev ([#858](https://github.com/iamharryliu/vigilant-broccoli/pull/858), [#859](https://github.com/iamharryliu/vigilant-broccoli/pull/859), [#862](https://github.com/iamharryliu/vigilant-broccoli/pull/862), [#892](https://github.com/iamharryliu/vigilant-broccoli/pull/892), [#1133](https://github.com/iamharryliu/vigilant-broccoli/pull/1133), [#997](https://github.com/iamharryliu/vigilant-broccoli/pull/997)).

### vibecheck-lite-next

- New weather app at vibecheck-lite.harryliu.dev with preparation badges based on wind and precipitation ([#870](https://github.com/iamharryliu/vigilant-broccoli/pull/870), [#878](https://github.com/iamharryliu/vigilant-broccoli/pull/878), [#879](https://github.com/iamharryliu/vigilant-broccoli/pull/879), [#911](https://github.com/iamharryliu/vigilant-broccoli/pull/911)).

### calendars

- New public calendar directory at calendars.harryliu.dev, with tabs and per-calendar visibility toggles ([#922](https://github.com/iamharryliu/vigilant-broccoli/pull/922), [#1033](https://github.com/iamharryliu/vigilant-broccoli/pull/1033)).

### links

- New links.harryliu.dev with shareable quick links ([#866](https://github.com/iamharryliu/vigilant-broccoli/pull/866)).

### bookmarks-react

- New bookmark manager at bookmarks.harryliu.dev that stores bookmarks in the browser, seeded with the public links ([#1165](https://github.com/iamharryliu/vigilant-broccoli/pull/1165), [#1225](https://github.com/iamharryliu/vigilant-broccoli/pull/1225)).

### pomodoro-react

- New Pomodoro timer at pomodoro.harryliu.dev, with settings in a dialog and the surrounding stages shown ([#1173](https://github.com/iamharryliu/vigilant-broccoli/pull/1173), [#1194](https://github.com/iamharryliu/vigilant-broccoli/pull/1194)).

### job-hunt-next

- New self-hostable job applications app with a Docker image and a public Vercel demo, saving postings from a bookmarklet and opening the original posting ([#1294](https://github.com/iamharryliu/vigilant-broccoli/pull/1294), [#1296](https://github.com/iamharryliu/vigilant-broccoli/pull/1296), [#1297](https://github.com/iamharryliu/vigilant-broccoli/pull/1297), [#1301](https://github.com/iamharryliu/vigilant-broccoli/pull/1301), [#1307](https://github.com/iamharryliu/vigilant-broccoli/pull/1307), [#1362](https://github.com/iamharryliu/vigilant-broccoli/pull/1362)).

### balloono

- New multiplayer arena game with CPUs and sound, optional Google sign-in, online match stats and public rankings, a 3-2-1 countdown and rebindable keys ([#945](https://github.com/iamharryliu/vigilant-broccoli/pull/945), [#1116](https://github.com/iamharryliu/vigilant-broccoli/pull/1116), [#1349](https://github.com/iamharryliu/vigilant-broccoli/pull/1349)).

### gravity-guy

- New gravity runner with courses, up to four local players, online rooms and mobile play, deployed on Vercel ([#1351](https://github.com/iamharryliu/vigilant-broccoli/pull/1351), [#1363](https://github.com/iamharryliu/vigilant-broccoli/pull/1363), [#1364](https://github.com/iamharryliu/vigilant-broccoli/pull/1364), [#1368](https://github.com/iamharryliu/vigilant-broccoli/pull/1368), [#1373](https://github.com/iamharryliu/vigilant-broccoli/pull/1373)).

### hearth

- New In Season page shows fruits and vegetables for any month, marks just-in and last-chance produce, and adds produce to the grocery list ([#1202](https://github.com/iamharryliu/vigilant-broccoli/pull/1202), [#1203](https://github.com/iamharryliu/vigilant-broccoli/pull/1203), [#1207](https://github.com/iamharryliu/vigilant-broccoli/pull/1207), [#1212](https://github.com/iamharryliu/vigilant-broccoli/pull/1212), [#1213](https://github.com/iamharryliu/vigilant-broccoli/pull/1213)).
- AI edit assistant for the shared whiteboard, which is hardened against silent wipes and fits above the mobile keyboard ([#939](https://github.com/iamharryliu/vigilant-broccoli/pull/939), [#1206](https://github.com/iamharryliu/vigilant-broccoli/pull/1206), [#1120](https://github.com/iamharryliu/vigilant-broccoli/pull/1120)).
- Optional automatic recipe tagging ([#916](https://github.com/iamharryliu/vigilant-broccoli/pull/916)).

### findme

- New Map, Nearby and People tabs for browsing places without sharing your location ([#930](https://github.com/iamharryliu/vigilant-broccoli/pull/930), [#932](https://github.com/iamharryliu/vigilant-broccoli/pull/932)).

### web-terminal

- New phone-friendly web terminal at shell.harryliu.dev, with touch scrolling, momentum and a keyboard toolbar ([#1217](https://github.com/iamharryliu/vigilant-broccoli/pull/1217), [#1220](https://github.com/iamharryliu/vigilant-broccoli/pull/1220), [#1246](https://github.com/iamharryliu/vigilant-broccoli/pull/1246), [#1255](https://github.com/iamharryliu/vigilant-broccoli/pull/1255)).

### react-lib

- Every app follows the system theme, toggles dark mode with the d key without a wrong-theme flash, and shares one color transition ([#1188](https://github.com/iamharryliu/vigilant-broccoli/pull/1188), [#1189](https://github.com/iamharryliu/vigilant-broccoli/pull/1189), [#1190](https://github.com/iamharryliu/vigilant-broccoli/pull/1190), [#1191](https://github.com/iamharryliu/vigilant-broccoli/pull/1191), [#1197](https://github.com/iamharryliu/vigilant-broccoli/pull/1197), [#1199](https://github.com/iamharryliu/vigilant-broccoli/pull/1199)).
- New LinkCard, a phone keyboard toolbar with Undo and Redo, an accessible MultiSelect, and mermaid diagrams in the docs viewers ([#861](https://github.com/iamharryliu/vigilant-broccoli/pull/861), [#1256](https://github.com/iamharryliu/vigilant-broccoli/pull/1256), [#1115](https://github.com/iamharryliu/vigilant-broccoli/pull/1115)).
- Loading states render nothing instead of text, and the weather clock card animates its forecast ([#1237](https://github.com/iamharryliu/vigilant-broccoli/pull/1237), [#1180](https://github.com/iamharryliu/vigilant-broccoli/pull/1180)).

### vb-manager-next

- Renamed to local-manager-next ([#1313](https://github.com/iamharryliu/vigilant-broccoli/pull/1313)).
- Résumé tailoring chat grounded in career experience and project contributions, with one-page PDF validation, plus cover letters and a background job-applications runner ([#926](https://github.com/iamharryliu/vigilant-broccoli/pull/926), [#936](https://github.com/iamharryliu/vigilant-broccoli/pull/936), [#937](https://github.com/iamharryliu/vigilant-broccoli/pull/937), [#1290](https://github.com/iamharryliu/vigilant-broccoli/pull/1290), [#1291](https://github.com/iamharryliu/vigilant-broccoli/pull/1291)).
- New Music page, a Spotify playlist relationship graph, Canada and China holiday calendars, and a daily Facebook event-calendar sync ([#952](https://github.com/iamharryliu/vigilant-broccoli/pull/952), [#741](https://github.com/iamharryliu/vigilant-broccoli/pull/741), [#1017](https://github.com/iamharryliu/vigilant-broccoli/pull/1017), [#1018](https://github.com/iamharryliu/vigilant-broccoli/pull/1018), [#1096](https://github.com/iamharryliu/vigilant-broccoli/pull/1096)).
- PR preview deployments are listed in the manager apps, and embedded quick links open as in-app pages with inline favorites ([#1187](https://github.com/iamharryliu/vigilant-broccoli/pull/1187), [#1384](https://github.com/iamharryliu/vigilant-broccoli/pull/1384)).

### vb-manager-next-mobile

- Renamed to mobile-manager-next ([#1314](https://github.com/iamharryliu/vigilant-broccoli/pull/1314)).
- New Apps page that launches native apps from grouped tiles, a Weather tab, and Notepad, Quick Links and Tasks folded into home tabs ([#1109](https://github.com/iamharryliu/vigilant-broccoli/pull/1109), [#1111](https://github.com/iamharryliu/vigilant-broccoli/pull/1111), [#1265](https://github.com/iamharryliu/vigilant-broccoli/pull/1265), [#1093](https://github.com/iamharryliu/vigilant-broccoli/pull/1093)).
- The phone agenda opens at a red now line and event details slide up in a bottom sheet ([#1092](https://github.com/iamharryliu/vigilant-broccoli/pull/1092), [#1152](https://github.com/iamharryliu/vigilant-broccoli/pull/1152)).

### office-presence-service

- HTTP Events API mode and a public demo ([#1088](https://github.com/iamharryliu/vigilant-broccoli/pull/1088), [#1099](https://github.com/iamharryliu/vigilant-broccoli/pull/1099), [#1100](https://github.com/iamharryliu/vigilant-broccoli/pull/1100)).

### employee-handler

- The HTTP API is a zod contract with generated OpenAPI, the UI has an employee detail drawer, and demo visitors can skip sign-in ([#884](https://github.com/iamharryliu/vigilant-broccoli/pull/884), [#883](https://github.com/iamharryliu/vigilant-broccoli/pull/883), [#1153](https://github.com/iamharryliu/vigilant-broccoli/pull/1153)).

### code-server

- Runs Claude Code Remote Control and Codex solves, and prunes unused images ([#961](https://github.com/iamharryliu/vigilant-broccoli/pull/961), [#1304](https://github.com/iamharryliu/vigilant-broccoli/pull/1304), [#1339](https://github.com/iamharryliu/vigilant-broccoli/pull/1339)).

### apps

- Every deployed app has its own emoji icon, also on the Apple home screen ([#921](https://github.com/iamharryliu/vigilant-broccoli/pull/921)).
- llm-service, utilities-ui and waiting-games images are published to Docker Hub ([#1160](https://github.com/iamharryliu/vigilant-broccoli/pull/1160)).

</details>

<details>
<summary>September 2026</summary>

### personal-website-react

- The résumé PDF has a stable public URL ([#572](https://github.com/iamharryliu/vigilant-broccoli/pull/572), [#573](https://github.com/iamharryliu/vigilant-broccoli/pull/573)).
- The About page shows interests and profile links in tables, the contact page leads with a direct way to reach a person, and the site is named after its domain ([#691](https://github.com/iamharryliu/vigilant-broccoli/pull/691), [#692](https://github.com/iamharryliu/vigilant-broccoli/pull/692), [#706](https://github.com/iamharryliu/vigilant-broccoli/pull/706), [#707](https://github.com/iamharryliu/vigilant-broccoli/pull/707)).
- Restored the desktop navbar with a mobile-only drawer, and the mobile view is content-only ([#695](https://github.com/iamharryliu/vigilant-broccoli/pull/695), [#705](https://github.com/iamharryliu/vigilant-broccoli/pull/705)).

### pages-index

- New Repo Timeline page charts lines of code, commits and PRs by day or month, with a range selector, hover crosshair and remembered view ([#623](https://github.com/iamharryliu/vigilant-broccoli/pull/623), [#736](https://github.com/iamharryliu/vigilant-broccoli/pull/736)).
- New Claude Context page renders the agent docs as a linked graph, opening full-viewport in its own tab ([#628](https://github.com/iamharryliu/vigilant-broccoli/pull/628), [#689](https://github.com/iamharryliu/vigilant-broccoli/pull/689)).
- The status page shows every workflow badge, not just the first 30 ([#656](https://github.com/iamharryliu/vigilant-broccoli/pull/656)).

### hearth

- New receipt tracker that keeps each scanned receipt's merchant, quantities and tax ([#567](https://github.com/iamharryliu/vigilant-broccoli/pull/567)).
- New Activity Planner page with a calendar date-range picker, and in-progress kitchen work tracked as timed mise en place ([#743](https://github.com/iamharryliu/vigilant-broccoli/pull/743), [#678](https://github.com/iamharryliu/vigilant-broccoli/pull/678)).

### react-lib

- The notepad supports VS Code-style Tab indent and Option+arrow line moves ([#552](https://github.com/iamharryliu/vigilant-broccoli/pull/552)).
- New Quick Links panel and a shared pastebin for both manager apps, and the docs explorer tree opens and closes smoothly ([#586](https://github.com/iamharryliu/vigilant-broccoli/pull/586), [#607](https://github.com/iamharryliu/vigilant-broccoli/pull/607), [#602](https://github.com/iamharryliu/vigilant-broccoli/pull/602)).

### react-sandbox

- New demos for quick links, a mock-driven tasks list and the docs explorer ([#585](https://github.com/iamharryliu/vigilant-broccoli/pull/585), [#592](https://github.com/iamharryliu/vigilant-broccoli/pull/592), [#604](https://github.com/iamharryliu/vigilant-broccoli/pull/604)).

### vb-manager-next

- The dashboard shows sunrise, sunset and the moon phase, and the notifications panel slides in and out ([#578](https://github.com/iamharryliu/vigilant-broccoli/pull/578), [#647](https://github.com/iamharryliu/vigilant-broccoli/pull/647), [#648](https://github.com/iamharryliu/vigilant-broccoli/pull/648), [#577](https://github.com/iamharryliu/vigilant-broccoli/pull/577)).
- Synced calendar events get readable names in a chosen language, and event calendars open an inline Google Calendar preview ([#622](https://github.com/iamharryliu/vigilant-broccoli/pull/622)).
- A failed Kanban fetch no longer overwrites saved boards, the TODO editor no longer drops rows it cannot parse, and Fly.io login failures are shown ([#687](https://github.com/iamharryliu/vigilant-broccoli/pull/687), [#748](https://github.com/iamharryliu/vigilant-broccoli/pull/748), [#686](https://github.com/iamharryliu/vigilant-broccoli/pull/686)).

### vb-manager-next-mobile

- Same curated quick links and search as the desktop manager, full screen on phones ([#580](https://github.com/iamharryliu/vigilant-broccoli/pull/580), [#581](https://github.com/iamharryliu/vigilant-broccoli/pull/581), [#597](https://github.com/iamharryliu/vigilant-broccoli/pull/597)).
- Read a QR code from an uploaded image, and the app and Google Tasks share one login ([#610](https://github.com/iamharryliu/vigilant-broccoli/pull/610), [#608](https://github.com/iamharryliu/vigilant-broccoli/pull/608)).

### code-server

- code.harryliu.dev ships with the toolchain baked in, and can push branches and open PRs as the agent's GitHub App ([#554](https://github.com/iamharryliu/vigilant-broccoli/pull/554), [#615](https://github.com/iamharryliu/vigilant-broccoli/pull/615)).

### fastify

- Reusable honeypot spam trap for APIs and React forms ([#369](https://github.com/iamharryliu/vigilant-broccoli/pull/369)).

### common-node

- Callers choose a weather provider, defaulting to Open-Meteo ([#579](https://github.com/iamharryliu/vigilant-broccoli/pull/579)).

### observability

- New Grafana and Loki VM on AWS collects Fly app logs ([#641](https://github.com/iamharryliu/vigilant-broccoli/pull/641)).

### apps

- Browser tabs, history and bookmarks name the current page instead of just the app ([#558](https://github.com/iamharryliu/vigilant-broccoli/pull/558)).
- Deploys email the deployed PR's details ([#758](https://github.com/iamharryliu/vigilant-broccoli/pull/758)).

</details>

<details>
<summary>August 2026</summary>

### hearth

- The Food Planner became a dashboard with a shared grocery list, kitchen chores, kitchen notes, a meal calendar, kitchen events and recipes stored in Supabase, with Markdown and recipe import, export and bulk delete ([#393](https://github.com/iamharryliu/vigilant-broccoli/pull/393), [#420](https://github.com/iamharryliu/vigilant-broccoli/pull/420), [#423](https://github.com/iamharryliu/vigilant-broccoli/pull/423), [#424](https://github.com/iamharryliu/vigilant-broccoli/pull/424), [#425](https://github.com/iamharryliu/vigilant-broccoli/pull/425), [#427](https://github.com/iamharryliu/vigilant-broccoli/pull/427), [#428](https://github.com/iamharryliu/vigilant-broccoli/pull/428), [#431](https://github.com/iamharryliu/vigilant-broccoli/pull/431), [#440](https://github.com/iamharryliu/vigilant-broccoli/pull/440)).
- Where Is gained camera capture, printable QR labels you can save or share, an image carousel, a Finder-style browser view and editable images ([#289](https://github.com/iamharryliu/vigilant-broccoli/pull/289), [#290](https://github.com/iamharryliu/vigilant-broccoli/pull/290), [#296](https://github.com/iamharryliu/vigilant-broccoli/pull/296), [#312](https://github.com/iamharryliu/vigilant-broccoli/pull/312), [#442](https://github.com/iamharryliu/vigilant-broccoli/pull/442), [#445](https://github.com/iamharryliu/vigilant-broccoli/pull/445)).
- New Home dashboard with a whiteboard and calendar, an overhauled mobile layout with a hamburger drawer, and full-screen dialogs on mobile ([#448](https://github.com/iamharryliu/vigilant-broccoli/pull/448), [#302](https://github.com/iamharryliu/vigilant-broccoli/pull/302), [#313](https://github.com/iamharryliu/vigilant-broccoli/pull/313)).
- Uploads go straight to storage through presigned URLs, and pages load faster ([#307](https://github.com/iamharryliu/vigilant-broccoli/pull/307), [#309](https://github.com/iamharryliu/vigilant-broccoli/pull/309), [#310](https://github.com/iamharryliu/vigilant-broccoli/pull/310)).
- The shared whiteboard and notepad sync live with Yjs, showing each collaborator's cursor and caret ([#293](https://github.com/iamharryliu/vigilant-broccoli/pull/293), [#294](https://github.com/iamharryliu/vigilant-broccoli/pull/294), [#295](https://github.com/iamharryliu/vigilant-broccoli/pull/295), [#303](https://github.com/iamharryliu/vigilant-broccoli/pull/303), [#529](https://github.com/iamharryliu/vigilant-broccoli/pull/529)).
- Tapping a calendar slot on mobile opens the new-event form, and a failing invite no longer blocks sign-up ([#482](https://github.com/iamharryliu/vigilant-broccoli/pull/482), [#395](https://github.com/iamharryliu/vigilant-broccoli/pull/395)).

### pages-index

- Linked repositories' READMEs render in the app, status is grouped by environment, and breadcrumbs replace the back link ([#270](https://github.com/iamharryliu/vigilant-broccoli/pull/270), [#278](https://github.com/iamharryliu/vigilant-broccoli/pull/278)).
- Swagger docs for private services are published statically, and the Open Source page lists every Docker Hub image and links to a GitHub repo listing ([#279](https://github.com/iamharryliu/vigilant-broccoli/pull/279), [#373](https://github.com/iamharryliu/vigilant-broccoli/pull/373), [#467](https://github.com/iamharryliu/vigilant-broccoli/pull/467)).
- Tighter spacing and simpler card actions across pages ([#450](https://github.com/iamharryliu/vigilant-broccoli/pull/450), [#451](https://github.com/iamharryliu/vigilant-broccoli/pull/451), [#452](https://github.com/iamharryliu/vigilant-broccoli/pull/452), [#454](https://github.com/iamharryliu/vigilant-broccoli/pull/454), [#455](https://github.com/iamharryliu/vigilant-broccoli/pull/455)).

### docs-md

- The note graph shows links at rest and has force controls ([#357](https://github.com/iamharryliu/vigilant-broccoli/pull/357)).
- Search is faster thanks to a build-time index, table-of-contents links scroll smoothly, and the tab title follows the open file ([#525](https://github.com/iamharryliu/vigilant-broccoli/pull/525), [#512](https://github.com/iamharryliu/vigilant-broccoli/pull/512), [#534](https://github.com/iamharryliu/vigilant-broccoli/pull/534)).

### react-sandbox

- Reworked into a lite Storybook with a searchable sidebar that remembers its selection, plus dark mode and icon-mode settings ([#389](https://github.com/iamharryliu/vigilant-broccoli/pull/389), [#469](https://github.com/iamharryliu/vigilant-broccoli/pull/469), [#472](https://github.com/iamharryliu/vigilant-broccoli/pull/472)).

### react-lib

- The notepad syncs live across devices with collaboration-aware undo and redo ([#518](https://github.com/iamharryliu/vigilant-broccoli/pull/518), [#520](https://github.com/iamharryliu/vigilant-broccoli/pull/520)).
- New Tooltip and Callout components, a D key theme toggle, and a sidebar that keeps nested menus open on mobile ([#433](https://github.com/iamharryliu/vigilant-broccoli/pull/433), [#434](https://github.com/iamharryliu/vigilant-broccoli/pull/434), [#287](https://github.com/iamharryliu/vigilant-broccoli/pull/287), [#465](https://github.com/iamharryliu/vigilant-broccoli/pull/465), [#471](https://github.com/iamharryliu/vigilant-broccoli/pull/471)).

### vb-manager-next-mobile

- Locked to the owner, with streaming voice transcription that falls back to the server, an OCR scan page and a synced notepad ([#331](https://github.com/iamharryliu/vigilant-broccoli/pull/331), [#332](https://github.com/iamharryliu/vigilant-broccoli/pull/332), [#333](https://github.com/iamharryliu/vigilant-broccoli/pull/333), [#339](https://github.com/iamharryliu/vigilant-broccoli/pull/339), [#342](https://github.com/iamharryliu/vigilant-broccoli/pull/342), [#444](https://github.com/iamharryliu/vigilant-broccoli/pull/444)).
- Sidebar navigation shared with the desktop app, a My Calendar home page and event calendars with an agenda grouped by date ([#486](https://github.com/iamharryliu/vigilant-broccoli/pull/486), [#490](https://github.com/iamharryliu/vigilant-broccoli/pull/490), [#498](https://github.com/iamharryliu/vigilant-broccoli/pull/498), [#502](https://github.com/iamharryliu/vigilant-broccoli/pull/502), [#539](https://github.com/iamharryliu/vigilant-broccoli/pull/539)).

### vb-manager-next

- Event calendars sync across machines and can use Facebook page events as sources ([#401](https://github.com/iamharryliu/vigilant-broccoli/pull/401), [#403](https://github.com/iamharryliu/vigilant-broccoli/pull/403), [#404](https://github.com/iamharryliu/vigilant-broccoli/pull/404)).
- An AI chat tab edits the résumé JSON, and the résumé PDF matches harryliu.dev ([#405](https://github.com/iamharryliu/vigilant-broccoli/pull/405), [#384](https://github.com/iamharryliu/vigilant-broccoli/pull/384)).
- New percent- and URL-encoding tools, a Terraform Cloud status card, a Settings page with a shortcuts cheatsheet, and the text tools and API keys moved into the dev dashboard ([#315](https://github.com/iamharryliu/vigilant-broccoli/pull/315), [#385](https://github.com/iamharryliu/vigilant-broccoli/pull/385), [#509](https://github.com/iamharryliu/vigilant-broccoli/pull/509), [#530](https://github.com/iamharryliu/vigilant-broccoli/pull/530), [#345](https://github.com/iamharryliu/vigilant-broccoli/pull/345), [#346](https://github.com/iamharryliu/vigilant-broccoli/pull/346)).
- Shared Google Tasks UI with a completed-tasks view ([#535](https://github.com/iamharryliu/vigilant-broccoli/pull/535), [#536](https://github.com/iamharryliu/vigilant-broccoli/pull/536)).

### employee-handler

- New absences timeline, and leave and birthday sync to several targets, including Google Calendar ([#477](https://github.com/iamharryliu/vigilant-broccoli/pull/477), [#213](https://github.com/iamharryliu/vigilant-broccoli/pull/213), [#481](https://github.com/iamharryliu/vigilant-broccoli/pull/481)).

### llm-service

- Stops the upstream OpenAI stream when the client disconnects ([#326](https://github.com/iamharryliu/vigilant-broccoli/pull/326)).

### immich

- Self-hosted on AWS behind a Cloudflare Tunnel ([#513](https://github.com/iamharryliu/vigilant-broccoli/pull/513)).

### facebook-event-scraper

- New Playwright scraper for Facebook event groups ([#323](https://github.com/iamharryliu/vigilant-broccoli/pull/323)).

### dotfiles

- Hammerspoon and Karabiner-Elements turn Caps Lock into a Spaces grid navigator with live window previews ([#516](https://github.com/iamharryliu/vigilant-broccoli/pull/516), [#526](https://github.com/iamharryliu/vigilant-broccoli/pull/526), [#528](https://github.com/iamharryliu/vigilant-broccoli/pull/528)).
- Night Shift runs from sunset to sunrise ([#517](https://github.com/iamharryliu/vigilant-broccoli/pull/517)).

</details>

<details>
<summary>July 2026</summary>

### pages-index

- The GitHub Pages index is now a React app, with icons on the home and Open Source cards.

### personal-website-react

- Reached parity with the Angular site for dark mode, badges and the contact form, which now posts to the right endpoint ([#127](https://github.com/iamharryliu/vigilant-broccoli/pull/127), [#129](https://github.com/iamharryliu/vigilant-broccoli/pull/129)).
- Loads faster by replacing the FontAwesome CDN with bundled Lucide icons ([#244](https://github.com/iamharryliu/vigilant-broccoli/pull/244)).

### docs-md

- Select several files at once to read them together as collapsible checklists, gated behind a multi-select toggle ([#189](https://github.com/iamharryliu/vigilant-broccoli/pull/189), [#191](https://github.com/iamharryliu/vigilant-broccoli/pull/191), [#194](https://github.com/iamharryliu/vigilant-broccoli/pull/194)).
- Full-text search across note contents, alongside filename search ([#190](https://github.com/iamharryliu/vigilant-broccoli/pull/190)).
- New note graph view, with a local graph mode, replacing the Obsidian app ([#207](https://github.com/iamharryliu/vigilant-broccoli/pull/207), [#246](https://github.com/iamharryliu/vigilant-broccoli/pull/246)).
- Internal note links and table-of-contents jumps work, and notes load from a deploy-time snapshot instead of hitting GitHub's rate limit ([#187](https://github.com/iamharryliu/vigilant-broccoli/pull/187), [#193](https://github.com/iamharryliu/vigilant-broccoli/pull/193), [#196](https://github.com/iamharryliu/vigilant-broccoli/pull/196)).

### hearth

- New Food Planner page with Notes, Recipes and Inventory tabs, and a whiteboard ([#84](https://github.com/iamharryliu/vigilant-broccoli/pull/84)).

### cloud-8-skate-angular

- Gallery images load resized from Sanity instead of at full resolution ([#116](https://github.com/iamharryliu/vigilant-broccoli/pull/116)).

### recipe-scraper

- Scrape a recipe from an image, and blocked or bot-protected pages fail cleanly ([#86](https://github.com/iamharryliu/vigilant-broccoli/pull/86), [#99](https://github.com/iamharryliu/vigilant-broccoli/pull/99)).

### vb-manager-next

- Google Tasks and Calendar stay connected, with tokens refreshed server-side ([#136](https://github.com/iamharryliu/vigilant-broccoli/pull/136)).
- New split-view résumé editor on the career page, Base64 tools, GitHub Apps quick links, and a calmer dev dashboard that no longer floods shell commands ([#264](https://github.com/iamharryliu/vigilant-broccoli/pull/264), [#144](https://github.com/iamharryliu/vigilant-broccoli/pull/144), [#155](https://github.com/iamharryliu/vigilant-broccoli/pull/155), [#134](https://github.com/iamharryliu/vigilant-broccoli/pull/134)).

### resume

- The résumé PDF is generated from repository data, with a project experience section ([#222](https://github.com/iamharryliu/vigilant-broccoli/pull/222), [#255](https://github.com/iamharryliu/vigilant-broccoli/pull/255), [#257](https://github.com/iamharryliu/vigilant-broccoli/pull/257)).

### react-lib

- New leaderboard components with data hooks, and the toaster moved to its own entry point so apps that never toast skip it ([#211](https://github.com/iamharryliu/vigilant-broccoli/pull/211), [#197](https://github.com/iamharryliu/vigilant-broccoli/pull/197)).

### llm-service

- Caps how many outputs one request can ask for, and reuses SDK clients per provider ([#115](https://github.com/iamharryliu/vigilant-broccoli/pull/115), [#215](https://github.com/iamharryliu/vigilant-broccoli/pull/215)).

### agent-sandbox

- New sandbox that resolves TODO items autonomously in parallel, authenticated with short-lived GitHub App tokens ([#117](https://github.com/iamharryliu/vigilant-broccoli/pull/117), [#119](https://github.com/iamharryliu/vigilant-broccoli/pull/119)).

### dotfiles

- Neovim works as a full editor with LSP, Treesitter, completion and formatting, and Neovide remembers its window size ([#243](https://github.com/iamharryliu/vigilant-broccoli/pull/243), [#239](https://github.com/iamharryliu/vigilant-broccoli/pull/239)).
- Weekly cleanup also prunes Docker volumes and build cache ([#171](https://github.com/iamharryliu/vigilant-broccoli/pull/171)).

</details>

<details>
<summary>June 2026</summary>

### personal-website

- The frontend moved from Angular to React ([#67](https://github.com/iamharryliu/vigilant-broccoli/pull/67)).

### findme

- New FindMe app for sharing a live location, with help and a mobile layout.

### hearth

- The home management app launched as Hearth, with a synced whiteboard and a location service.

### vb-manager-next

- New Tailscale, Vercel and local services dashboards, a QR code tool, GitHub org roles and a synced notepad.
- Kanban board settings sync across machines, and language learning has a speed setting.
- A network monitor tracks connectivity.

### docs-md

- New Markdown editor and a fixed mobile layout.

### employee-handler

- Refreshed UI.

### office-presence

- Translated UI.

### upptime

- Public services are monitored by Upptime, with a status page.

</details>

<details>
<summary>May 2026</summary>

### vb-manager-next

- New mobile version, with sign-in moved from Better Auth to Supabase.
- The chatbot creates Google Tasks and calendar events from chat or a voice prompt, and can browse docs.
- New notifications, a help modal, GitHub deployment alerts and a GitHub Pages listing, with file storage through the new bucket service API.

### next-demo

- Home management gained household rules, a price tracker, a refreshed sidebar and a better Where Is tracker.

### react-lib

- Moved to shadcn components, with new sidebar, button list, icon button, dark mode toggle, user avatar and speech-to-text components.

### docs-md

- Deployed to GitHub Pages, with checklist previews and a cleaner mobile view.

### email-subscription-service

- New email subscription service.

### office-presence

- User settings.

### money-movement

- New `@vigilant-broccoli/money-movement` library.

</details>

<details>
<summary>April 2026</summary>

### vb-manager-next

- New Pomodoro timer, a Where Is tracker, a voice list generator and Google Tasks sorted by created date with bulk creation.
- AWS management, Grafana logging, and calendar events created from chat.
- Shared list UI gained an ellipsis menu, delete confirmations and list upload.

### next-demo

- New home management app on Better Auth and Supabase: homes with invited members and roles, a Where Is tracker with import and export, and a calendar.
- Leisure activities and resource management, tied into the calendar.

### office-presence

- Deploys as a Docker container.

### personal-website

- Updated contact form.

</details>

<details>
<summary>March 2026</summary>

### vb-manager-next

- Kanban boards with swimlanes, renaming and reordering, and Google Tasks that can be reordered and scroll in long lists.
- Quick links with keyboard navigation, a movable floating island, a notepad and better weather and calendar widgets.
- The chatbot lets you pick a model, takes speech input and knows the current date and time.
- Better GCP management and Wrangler login.

### cloud8skate

- FAQ, Playlists and the gallery are managed in Sanity CMS, with a refreshed UI.

### personal-website

- Refreshed UI with SEO improvements, in-app navigation instead of new tabs, and an updated résumé download.

### office-presence

- New office events feature ([#14](https://github.com/iamharryliu/vigilant-broccoli/pull/14)).

### local-infra

- Local Docker Compose stack with Resilio Sync, Immich, Postgres with Adminer, and Grafana ([#10](https://github.com/iamharryliu/vigilant-broccoli/pull/10)).

</details>

<details>
<summary>February 2026</summary>

### vb-manager-next

- New Jarvis chatbot with planning suggestions and a richer UI ([#5](https://github.com/iamharryliu/vigilant-broccoli/pull/5)).
- Keyboard shortcuts, an email modal, a text messaging demo and a floating island toolbar.
- The Wrangler page shows Pages domains, and the secret generator lets you pick a secret type.

### slack-bots

- New `@vigilant-broccoli/slack-workspace` and `@vigilant-broccoli/slack-bots` libraries for Slack automation ([#6](https://github.com/iamharryliu/vigilant-broccoli/pull/6), [#7](https://github.com/iamharryliu/vigilant-broccoli/pull/7)).

### vb-express

- Request logging.

### games

- New Godot game and a Valentine's Day game.

### common-js

- New metronome utility and Vercel library.

</details>

<details>
<summary>January 2026</summary>

### vb-manager-next

- The dashboard gained a clock, stopwatch, timer, alarm, calculator, a search dialog and a VS Code Paperwhite theme.
- New Cloudflare Wrangler dashboard, a secret generator and quick links that keep their state.

### vb-express

- New Express service with a secured `/llm` endpoint.

### dotfiles

- New `tmux-vb` workspace with a tmux and Neovide setup, Vault secret management and IAP SSH.

</details>

<details>
<summary>December 2025</summary>

### vb-manager-next

- New Next.js manager dashboard, replacing vb-manager, with calendars, a pastebin, conversions, LLM tools, DJ tools and Docker controls.
- Secret management backed by Vault, with a Vault backup script.
- File storage through a new bucket service.

### recipe-scraper

- New recipe scraper with language support.

### common-node

- New Stripe and bucket storage integrations, with a Stripe demo.

### containers

- Generic database Docker containers for local development.

</details>

<details>
<summary>November 2025</summary>

### rabbitmq-service

- Fixed CI deployment.

</details>

<details>
<summary>October 2025</summary>

### vb-manager

- The text and AI tools moved into the manager, and the GitHub manager gained more controls.

### stripe-demo

- New Stripe payments demo.

</details>

<details>
<summary>September 2025</summary>

### vb-manager

- Light and dark mode, weather links, and GitHub team create, update and delete, with the organization structure exportable as JSON.

### common-node

- New Slack interface and warnings for unset environment variables.

</details>

<details>
<summary>August 2025</summary>

### vb-manager

- First version of the manager app, showing GitHub Action statuses and starting GitHub team management.

### cloud8skate

- Responsive calendar view and site content updates.

### small-business

- New small business app with sign-in and S3 uploads.

### harryliu-dev

- Added an IMDb link.

</details>

<details>
<summary>July 2025</summary>

### vb-automations

- The résumé PDF is generated by a GitHub Action.

### calendar

- New calendar app with events and a timeline view.

### cloud8skate

- The calendar section embeds the Google Calendar.

### vb-manager

- New manager app, starting with a GitHub configuration list.

</details>

<details>
<summary>June 2025</summary>

### ui-tools

- New Next.js tools app with a JSON tools page, conversion forms, file upload and copy-to-clipboard text.
- New AI page backed by a shared LLM service, with saved prompts you can create, edit and delete, and image generation.

### react-lib

- New shared components, including a CRUD list that can render items as cards.

### github-iac

- GitHub repositories and settings are managed as infrastructure as code.

### automation

- A script downloads the résumé as a PDF.

</details>

<details>
<summary>April 2025</summary>

### google-service

- Improved Google service integration in the shared libraries.

</details>

<details>
<summary>March 2025</summary>

### cloud8skate

- Updated contact email.

</details>

<details>
<summary>February 2025</summary>

### employee-handler

- New app with a UI and simple auth for onboarding and offboarding employees, syncing accounts and sending email signatures.

### home-management

- New home management app, starting with vehicle details.

### cloud8skate

- New Rules page whose content comes from the CMS.

### libraries

- New shared `@vigilant-broccoli/common-js`, `common-node`, `common-browser` and `react-lib` libraries, with a RabbitMQ queue helper.

</details>

<details>
<summary>January 2025</summary>

### personal-website

- Dark mode, and an updated résumé.

### demos

- New Go, RabbitMQ (deployed on Fly.io) and WebSocket demos.

</details>

<details>
<summary>December 2024</summary>

### dotfiles

- Ongoing dotfiles and alias updates.

</details>

<details>
<summary>November 2024</summary>

### cloud8skate

- Improved image gallery.

### swift-demo

- New Swift demo app.

</details>

<details>
<summary>October 2024</summary>

### harryliu-dev

- The personal website moved from harryliu.design to harryliu.dev, along with vibecheck and the Markdown notes.

### new-tab-dashboard

- New browser new-tab dashboard app.

### cloud8skate

- Refreshed home page.

### cms-flask

- Better image handling, with the storage bucket configurable per deployment.

### dotnet-demo

- Deploys to Fly.io.

</details>

<details>
<summary>September 2024</summary>

### todo-lib

- New npm library shared by the demo todo apps, with a matching .NET todo API.

### common-lib

- New shared common library and simple logger.

### react-demo

- App-wide error handling.

### angular-lib

- Scroll to anchor links.

### vibecheck-lite

- Smaller cities file for faster loading.

</details>

<details>
<summary>August 2024</summary>

### grind-75

- Reviewed the Grind 75 list in Python and TypeScript, with new TypeScript solutions for trees, linked lists, graphs and intervals, and Go test cases.

### demo-apps

- New todo app built three ways: React with an Express API, and a Vue app with routing and a store, each supporting create, update and delete.

### harryliu-design

- docs-md appears in the navbar.

### dj-scripts

- DJ scripts pull playlists through the Spotify API, log run time and clean up old directories.

</details>

<details>
<summary>July 2024</summary>

### harryliu-design

- New job hunt mode, and Markdown pages print cleanly.

### docs-md

- Folders are sorted, file selection no longer flickers, and you can return to the index file.

### grind-75

- Choose a solution language, and the file tree stays expanded on refresh.

### cms-flask

- Admins can add, update and delete users, manage per-app privileges and edit app settings.

### react-demo

- New Todo and Hooks pages, a not-found page and a collapsing navbar.

### setup

- The macOS install script configures the Dock and other system settings, skips existing symlinks and installs Nx globally.

</details>

<details>
<summary>June 2024</summary>

### grind-75

- Solutions now include TypeScript and Go alongside Python, with Jest tests.

### cms-flask

- User privileges, a logout button and fixed redirects.

### cloud8skate

- Updated title, meta tags, navigation and More section.

### toronto-alerts

- Subscribers can update an existing subscription, and the daily and weather emails were fixed.

### angular-lib

- New loading button, and the navbar fades on scroll.

### docs-md

- The file explorer expands the folder of the current path.

### vibecheck-flask

- Moved into the repository.

</details>

<details>
<summary>May 2024</summary>

### toronto-alerts

- New daily weather email alert, and the subscription form is protected against SQL injection.
- The TTC line scraper reports service changes more reliably.

### cloud8skate

- Rebuilt site with a navbar, Markdown home page content, contact, FAQ, More Info and Playlists pages, an event calendar, an image gallery and Google Analytics.
- Gallery images and page content come from the new CMS.

### cms-flask

- New Flask CMS for uploading image albums, browsing and deleting them, and editing page content, starting with Cloud 8.

### harryliu-design

- New Contact and Career pages, with contact form CORS fixed for other sites that share the API.

### angular-lib

- Shared navbar, link and image gallery components moved to signals.

### react-demo

- Examples for context, custom hooks, refs and reducers.

</details>

<details>
<summary>April 2024</summary>

### toronto-alerts

- Renamed from gta-update-alert, with a refreshed UI, districts sorted by name and Ko-fi donation links.
- New TTC service alerts and notices alongside police and fire alerts, with email verification for subscribers.
- Email alerts run from a cron job on the Fly deployment instead of GitHub Actions.
- New dashboard with weather, police and fire data, quick links and a More page.

### personal-website

- New coding blog posts, including a series on styling libraries, and Ko-fi donation links.

### cloud8skate

- New site for the Cloud 8 skate community.

### secrets-manager

- New secrets manager service deployed on Fly.io.

### repo

- A script backs the repository up to Google Drive.

</details>

<details>
<summary>March 2024</summary>

### gta-update-alert

- New Toronto police and fire update alerts: a scheduled GitHub Action scrapes recent incidents and emails subscribers, who sign up and unsubscribe through a Flask app.
- Alerts can be filtered by district and keywords, and arrive near live.

### personal-website

- New blog with posts in the navbar and a subscribe form, plus a blog directory.
- Projects page lists Toronto alerts and other projects, and the résumé and link tree sit in the header.
- Site analytics added, and the mobile navbar closes after navigation.

### dj-music

- Scripts download Spotify playlists into a DJ library.

</details>

<details>
<summary>February 2024</summary>

### harryliu-design

- The personal website lists projects, including Grind 75, in the navbar and Projects page, with an updated About page.
- New Markdown library renders Markdown notes as pages on the site.

### node-tools

- New text message service alongside email, a cron job service and warnings for missing environment variables.

### app-monitor-api

- Site monitoring moved from a script into an API endpoint.

### dotfiles

- Aliases for Fly.io, Cloudflare, Postgres, AWS and Nx.

### demos

- New Spring Boot and .NET demo apps.

### ci

- A GitHub Actions workflow runs end-to-end tests for affected Nx projects.

</details>

<details>
<summary>January 2024</summary>

### personal-website

- Upgraded to Angular 17 and dropped ngx-translate.
- New Projects page and navbar update; the personal website moved into an Nx monorepo with Cypress end-to-end tests.
- New admin route that shows the status of monitored apps.

### repeat-timer

- New repeat timer app, first on the personal site and then as its own project.

### app-monitor-api

- New API that checks monitored sites, used by the admin page.

### nx-workspace

- New Nx workspace with an Angular UI, an Express API and shared node-tools libraries.

### dotfiles

- `install.sh` sets up a new macOS machine, with zsh autosuggestions, git config and aliases for git branches and killing ports.

</details>

<details>
<summary>December 2023</summary>

### personal-website

- New Services page and a link-tree link, with loading spinners and response messages on subscription forms.

### vibecheck-flask

- New Flask API with users, bcrypt-hashed passwords, Flask-Login sessions and follow/unfollow, plus a small React client to exercise it.

### dotfiles

- First dotfiles and shell scripts for setting up a machine.

### demos

- New Django and Flask demo apps, and Python unit tests for the Grind 75 problems.

</details>

<details>
<summary>November 2023</summary>

### personal-website

- Newsletter sign-ups are confirmed by a verification email, with addresses stored encrypted.
- Added a résumé, a link tree page and a return-to-top button.
- Fixed language flicker and request race conditions on first load, and errors now surface through a shared error interceptor.

### vibecheck-lite

- Subscribe to daily vibecheck-lite emails, and unsubscribe from them, with a loading spinner while results load.

### react-demo

- New React demo app.

### graphql-demo

- New GraphQL demo with query and update mutation examples.

</details>

<details>
<summary>October 2023</summary>

### personal-website

- New Express backend, deployed to Fly.io with Docker, behind the site's contact form and newsletter.
- Visitors can send a message from the contact page, protected by reCAPTCHA so low-score submissions are rejected.
- Visitors can subscribe to an email newsletter from the site, and duplicate addresses are rejected.
- Redesigned home page, footer and contact page, with project cards linking out to each project.

### vibecheck-lite

- New app that suggests an outfit from your location's weather, using ChatGPT, with a card on the personal website.

### site-monitor

- New script that checks the personal website and emails the admin when it is down.

</details>

<details>
<summary>August 2023</summary>

### express-demo

- New demo Express server.

### repo

- Linting runs per project instead of only at the root.

</details>

<details>
<summary>July 2023</summary>

### personal-website

- First version of the personal website: an Angular 16 app with Tailwind, a navbar and Home, About and Contact pages.

### repo

- Repository created with ESLint, Prettier and a pre-commit hook that lints every commit.

</details>
