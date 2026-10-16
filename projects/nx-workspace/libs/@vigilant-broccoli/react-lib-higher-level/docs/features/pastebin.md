# Pastebin

Searchable, grouped list of entries with switchable views. It knows nothing about links; `QuickLinksPanel` is a thin adapter over it.

## Usage

- Pass `groups` of `{ name, entries }`. An entry is `{ label, value, onOpen?, isExternal? }`; an empty group `name` renders no heading.
- Views: `rows` (copy/open rows), `grouped` (buttons under headings) and `list` (flat buttons). A segmented control switches them. `defaultView` sets the initial view (`rows` by default); `storageKey` persists the user's choice in localStorage.
- An entry's primary action is `onOpen`, then opening `value` when it starts with `http`, then copying it. `onEntryOpen` runs after any primary action. `autoFocusSearch` focuses the search box on mount.
- Search fuzzy-matches the label and substring-matches the value. Results are ordered by score, and Enter in the search box runs the best match and clears the query.
- Arrow keys move focus between items (`data-quick-link-item`) and back to the search box in every view. In `rows`, each row is focusable and Enter runs its primary action; keys bubbling from the inner copy/open buttons are ignored.

## QuickLinksPanel

- Sorts links by label, groups them by `subgroup` (ungrouped links first) and maps them to entries: shell links call `onShellExecute`, embed links call `onEmbedOpen` when `canEmbed` allows.
- Defaults to the `grouped` view and persists under `quick-links-view`.
- Shell links show the external-link icon in `rows`.
