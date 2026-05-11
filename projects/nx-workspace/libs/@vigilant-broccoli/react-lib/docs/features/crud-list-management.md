# CRUDListManagement

`libs/@vigilant-broccoli/react-lib` — generic list UI with create, update, delete.

## Exports

- `CRUDItemList` — main list component
- `EllipsisCTA` — reusable ellipsis popover with Update + Delete (with confirmation)
- `DeleteItemConfirmationDialog` — standalone "are you sure" dialog
- `CRUDFormProps<T>` — form component prop type

## CRUDItemList Props

- `items`, `setItems` — list state
- `FormComponent` — used for create + update dialogs
- `ListItemComponent` — renders each row; receives `item`, `items`, `ellipsis`
- `createItem`, `updateItem`, `deleteItem` — async handlers
- `createItemFormDefaultValues` — enables create button in header
- `onItemClick` — makes rows clickable
- `isCards` — wraps rows in Radix `Card`
- `showEllipsis` — defaults `true`; hides ellipsis when `false`
- `copy` — override titles/labels
- `HeaderComponent`, `FooterComponent` — optional slots

## EllipsisCTA Props

- `onUpdate` — called when Update is clicked (opens dialog in parent)
- `onDelete` — called after delete confirmation

## Behaviour

- Ellipsis popover closes when update dialog opens (uncontrolled Radix pattern)
- Delete always goes through confirmation dialog with loading state
- `stopPropagation` on ellipsis wrapper prevents triggering `onItemClick`
