# Searchable List

`SearchableList` in `react-lib-higher-level` owns search, keyboard navigation and views for grouped entries; `react-lib-quick-links` builds its panel on it ([quick links](../../../react-lib-quick-links/docs/features/quick-links.md)) and bookmarks-react uses `SearchableListRow`.

## Behaviour

- Groups of `{ name, entries }`; an entry is `{ label, value, onOpen?, isExternal? }` and an empty group `name` renders no heading.
- Entries may include `isFavorite` and `onFavoriteToggle` to render an accessible favorite control in rows and a star-prefixed label in badge views. The Favorites group stays first after search filtering; flat list view labels its favorite badges with a heading before the remaining badges.
- Views: `rows` (copy/open rows), `grouped` (buttons under headings) and `list` (flat buttons), switched by icon-only tabs (`Tabs`, the same style as `TabbedView`). `storageKey` persists the choice in localStorage. When storage is unavailable, the default view and in-memory view switching remain usable.
- Rows use small uppercase muted headings and rounded bordered groups with compact, divided rows. Labels and destination values truncate on narrow screens; full values remain available through copy and hover titles. Shared theme tokens style surfaces, dividers and interaction states in light and dark themes.
- An entry's optional `menuActions` (`EllipsisAction[]`) adds an ellipsis menu after the copy button in rows and replaces the open button, since clicking the row already opens it.
- `SearchableListRow` is exported for custom listings; its optional `actions` prop replaces the default favorite, open and copy buttons.
- An entry's primary action is `onOpen`, then opening `value` when it starts with `http`, then copying it.
- Search fuzzy-matches the label and substring-matches the value. Results are ordered by score, and Enter in the search box runs the best match and clears the query.
- Arrow keys move focus between items (`data-quick-link-item`) and back to the search box in every view. In `rows`, clicking the label/value area or pressing Enter or Space on its native button runs the primary action. Open and copy are sibling buttons; copy never opens a destination or closes the dialog.
