# Quick Links

Searchable, grouped link launcher. `QuickLinksDialog` wraps `QuickLinksPanel` in a modal; the panel maps `QuickLink[]` onto `entry-directory`'s [`EntryDirectory`](../../../entry-directory/docs/features/entry-directory.md), which owns search, keyboard navigation and views.

## QuickLinksPanel

- Sorts links by label and groups them by `subgroup` (ungrouped links first). `preserveOrder` keeps the input order of links and subgroups instead, for hand-ordered lists like `PASTEBIN_LINKS`.
- `enableFavorites` adds a keyboard-operable star toggle to each row link and moves favorites into a `Favorites` group at the top. Badge views have no toggle and prefix a favorite's label with a star; toggle favorites from the rows view. Toggling a star does not run or close the link action; identical links (same label, target, type, args, subgroup and embed flag) share favorite state.
- Favorites are stored as `quick-links-favorites` in origin-scoped localStorage and shared by enabled panels on that origin. Storage failures leave favorites usable for the current session; disabling the option leaves the panel presentation unchanged.
- Shell links (Mac app, VS Code, file system) call `onShellExecute`; embed links call `onEmbedOpen` when `canEmbed` allows; everything else opens in a new window. `onLinkOpen` runs after any open.
- Defaults to the `grouped` view and persists the choice under `quick-links-view`. `QUICK_LINKS_VIEW` lists the views for `defaultView`.
- Shell links show the external-link icon in `rows`.

## QuickLinksDialog

- Focuses the search box when opened and closes after a link opens.
- Animates its height as search filtering changes the row count (`sm:` and up, honors reduced motion); the full-screen mobile layout is unchanged.
- Owns the embedded link and renders it in `EmbedDialog`.
