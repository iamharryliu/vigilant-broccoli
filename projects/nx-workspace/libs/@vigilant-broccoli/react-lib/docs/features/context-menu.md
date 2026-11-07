# Context Menu

Right-click menu over `@radix-ui/react-context-menu`, styled and themed like `DropdownMenu`.

## Usage

- Import `ContextMenu` from the public library barrel and compose `ContextMenu.Root`, `ContextMenu.Trigger`, `ContextMenu.Content`, `ContextMenu.Item` and `ContextMenu.Separator`.
- `Trigger` defaults to `asChild`, so it overrides the browser's native menu only on the element it wraps. Wrap individual items rather than a whole container when empty space should keep the native menu.
- `Item` accepts `color` (`red`, `gray`) for destructive or muted actions; run actions from `onSelect`.
- Portal content copies the originating theme scope, like `DropdownMenu`.

## Constraints

- Opening an `AlertDialog` from an item while the menu is modal can leave `pointer-events: none` on `body`, since the menu and the dialog restore it separately. Pass `modal={false}` on `Root` when an item opens a dialog, as `FileExplorer` does.
