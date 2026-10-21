# Quick Links

Searchable, grouped link launcher. `QuickLinksDialog` wraps `QuickLinksPanel` in a modal; the panel maps `QuickLink[]` onto the internal, unexported `SearchableList`, which owns search, keyboard navigation and views.

## QuickLinksPanel

- Sorts links by label and groups them by `subgroup` (ungrouped links first). `preserveOrder` keeps the input order of links and subgroups instead, for hand-ordered lists like `PASTEBIN_LINKS`.
- Shell links (Mac app, VS Code, file system) call `onShellExecute`; embed links call `onEmbedOpen` when `canEmbed` allows; everything else opens in a new window. `onLinkOpen` runs after any open.
- Defaults to the `grouped` view and persists the choice under `quick-links-view`. `QUICK_LINKS_VIEW` lists the views for `defaultView`.
- Shell links show the external-link icon in `rows`.

## QuickLinksDialog

- Focuses the search box when opened and closes after a link opens.
- Owns the embedded link and renders it in `EmbedDialog`.

## SearchableList

- Groups of `{ name, entries }`; an entry is `{ label, value, onOpen?, isExternal? }` and an empty group `name` renders no heading.
- Views: `rows` (copy/open rows), `grouped` (buttons under headings) and `list` (flat buttons), switched by a segmented control. `storageKey` persists the choice in localStorage. When storage is unavailable, the default view and in-memory view switching remain usable.
- An entry's primary action is `onOpen`, then opening `value` when it starts with `http`, then copying it.
- Search fuzzy-matches the label and substring-matches the value. Results are ordered by score, and Enter in the search box runs the best match and clears the query.
- Arrow keys move focus between items (`data-quick-link-item`) and back to the search box in every view. In `rows`, Enter on a focused row runs its primary action; keys bubbling from the inner copy/open buttons are ignored.
