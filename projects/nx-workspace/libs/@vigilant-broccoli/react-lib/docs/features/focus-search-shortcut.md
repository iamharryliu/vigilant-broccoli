# Focus Search Shortcut

`useFocusSearchShortcut(onFocusSearch, { enabled })` binds `/` to a window `keydown` listener, so every page-level search answers to the same key.

## Keys

- `/` calls `onFocusSearch` unless `shouldIgnoreShortcutKeystroke` rejects it: inside an input, textarea, select, textbox/combobox/searchbox role or contenteditable, while a dialog is open, with Ctrl/Cmd/Alt held, during IME composition, or after another handler called `preventDefault`.
- A match calls `preventDefault`, so the slash is not typed.
- Cmd/Ctrl+F is deliberately not bound: the browser's find keeps working on every page, including where the shortcut opens a search dialog instead of focusing an input.

## Usage

- Pass a stable `onFocusSearch` (`useCallback`); it focuses and selects the input, or opens the search dialog.
- Pass `enabled: false` to unbind, e.g. when the search feature is off.
- Consumers: `docs-explorer`'s `DocsExplorer` (when `search` is set), `local-manager-next`'s page layout (opens the search dialog) and `mobile-manager-next`'s `/apps` search.
