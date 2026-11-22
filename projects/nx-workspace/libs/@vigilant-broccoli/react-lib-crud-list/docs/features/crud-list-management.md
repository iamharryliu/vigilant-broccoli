# CRUDListManagement

`libs/@vigilant-broccoli/react-lib-crud-list` — generic list UI with create, update, delete.

## Exports

- `CRUDItemList` — main list component
- `CRUDItemFormDialog` — the create/update dialog, usable on its own; `showCloseButton` adds an X inline with the title
- `CRUDFormProps<T>` — form component prop type: `submitHandler` saves and closes, `saveHandler` saves without closing (autosave), `registerCloseGuard` registers an async guard the dialog awaits before closing

Row menus use react-lib's `EllipsisCTA` (see [ellipsis-cta.md](../../../react-lib/docs/features/ellipsis-cta.md)).

## CRUDItemList Props

- `items`, `setItems` — list state
- `FormComponent` — used for create + update dialogs
- `ListItemComponent` — renders each row; receives `item`, `items`, `ellipsis`
- `createItem`, `updateItem`, `deleteItem` — async handlers; `updateItem` may resolve with the saved item, which replaces the row
- `createItemFormDefaultValues` — enables create button in header
- `ExpandedComponent` — makes each row expandable: clicking the row toggles an animated panel below it rendering `<ExpandedComponent item />`, with a chevron beside the ellipsis; the ellipsis stays in the header row and is not pushed by the panel. The panel mounts on first expand and stays mounted so it can animate closed
- `defaultExpandedIds` — ids expanded on first render (read once, so mount the list after `items` load)
- `onItemClick` — makes rows clickable
- `isCards` — wraps rows in Radix `Card`
- `showEllipsis` — defaults `true`; hides ellipsis when `false`
- `itemActions` — extra ellipsis entries; without `FormComponent` the menu holds only these (read-only list)
- `copy` — override titles/labels
- `showDialogCloseButton` — passes `showCloseButton` to the create and update dialogs
- `deleteConfirmation` — `{ title, description }` override for the delete confirmation dialog
- `search` — `{ value, onChange, placeholder }` replaces the title with a clearable search input inline with the create button; the list stays controlled, so the consumer filters `items` itself
- `createLabel` — text beside the create button's `+` icon (icon only by default)
- `compact` — tightens the gap between rows (`space-y-1` instead of `space-y-4`)
- `HeaderComponent`, `FooterComponent` — optional slots

## Behaviour

- Ellipsis popover closes when update dialog opens (uncontrolled Radix pattern)
- Delete always goes through confirmation dialog with loading state
- Every dialog close (header X, Escape, overlay click) awaits the form's close guard when one is registered; the dialog stays open if it resolves `false`, and the X is disabled while it runs. `onCancel` closes without the guard
- `stopPropagation` on ellipsis wrapper prevents triggering `onItemClick`
