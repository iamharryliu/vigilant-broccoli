# Focus Search Shortcut

`useFocusSearchShortcut(onFocusSearch, { enabled, searchRef })` binds the shared "focus search" keys to a window `keydown` listener, so every page-level search answers to the same keys.

## Keys

- `/` calls `onFocusSearch` unless `shouldIgnoreShortcutKeystroke` rejects it: inside an input, textarea, select, textbox/combobox/searchbox role or contenteditable, while a dialog is open, with Ctrl/Cmd/Alt held, during IME composition, or after another handler called `preventDefault`.
- Cmd+F (macOS) or Ctrl+F (elsewhere) calls `onFocusSearch` from anywhere, including another text field or editor. `metaKey` or `ctrlKey` with `f` in either case; Alt or Shift disables it.
- Either match calls `preventDefault`, so the slash is not typed and the browser's find bar does not open.

## Cmd/Ctrl+F guards

- Skipped while `searchRef.current` is the focused element, so a second press reaches the browser's native find.
- Skipped when the event is already `defaultPrevented` (e.g. an editor with its own find), during IME composition, or while a dialog is open, unless that dialog contains `searchRef.current`.
- Without `searchRef` any open dialog skips it, which suits searches that open as a dialog: once the dialog is open, the browser's find takes over.

## Usage

- Pass a stable `onFocusSearch` (`useCallback`); it focuses and selects the input, or opens the search dialog.
- Pass `enabled: false` to unbind, e.g. when the search feature is off.
- Consumers: `docs-explorer`'s `DocsExplorer` (when `search` is set), `local-manager-next`'s page layout (opens the search dialog) and `mobile-manager-next`'s `/apps` search.
