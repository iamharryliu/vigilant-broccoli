# Quick Links

Searchable, grouped link launcher. `QuickLinksDialog` wraps `QuickLinksPanel` in a modal; the panel maps `QuickLink[]` onto the internal, unexported `SearchableList`, which owns search, keyboard navigation and views.

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

## SearchableList

- Groups of `{ name, entries }`; an entry is `{ label, value, onOpen?, isExternal? }` and an empty group `name` renders no heading.
- Entries may include `isFavorite` and `onFavoriteToggle` to render an accessible favorite control in rows and a star-prefixed label in badge views. The Favorites group stays first after search filtering; flat list view labels its favorite badges with a heading before the remaining badges.
- Views: `rows` (copy/open rows), `grouped` (buttons under headings) and `list` (flat buttons), switched by icon-only tabs (`Tabs`, the same style as `TabbedView`). `storageKey` persists the choice in localStorage. When storage is unavailable, the default view and in-memory view switching remain usable.
- Rows use small uppercase muted headings and rounded bordered groups with compact, divided rows. Labels and destination values truncate on narrow screens; full values remain available through copy and hover titles. Shared theme tokens style surfaces, dividers and interaction states in light and dark themes.
- An entry's primary action is `onOpen`, then opening `value` when it starts with `http`, then copying it.
- Search fuzzy-matches the label and substring-matches the value. Results are ordered by score, and Enter in the search box runs the best match and clears the query.
- Arrow keys move focus between items (`data-quick-link-item`) and back to the search box in every view. In `rows`, clicking the label/value area or pressing Enter or Space on its native button runs the primary action. Open and copy are sibling buttons; copy never opens a destination or closes the dialog.
