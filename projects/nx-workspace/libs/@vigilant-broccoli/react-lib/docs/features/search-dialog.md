# Search Dialog

`SearchDialog` is a command-palette style dialog: a text input over a fuzzy-filtered result list.

## Usage

- Controlled: pass `open`/`onOpenChange`, `items` (`{ id, title, description? }`, extendable through the generic), `onSelect`, and translated `title`, `description`, `placeholder` and `emptyLabel`. `title` and `description` are visually hidden but required for the dialog's accessible name.
- Bind the `/` key yourself with [`useFocusSearchShortcut`](./focus-search-shortcut.md) calling `onOpenChange(true)`; the dialog holds no shortcut.
- Results are ranked by `fuzzyMatch` on `title` and capped by `maxResults` (default 8); an empty query shows the first `maxResults` items in the given order.
- Arrow keys move the highlight (wrapping), Enter selects it, hover moves it. Selecting calls `onOpenChange(false)` and then `onSelect`, so navigation is the caller's job.
- The result list's height is observed through a callback ref and animated; an effect keyed on `open` would run before the portal mounts the list and leave it at zero height.
- Consumers: `projects-hub`'s `SearchDialog`, which builds items from its routes and cards.
