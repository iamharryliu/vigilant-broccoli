# EllipsisCTA

Row-level ellipsis menu in `libs/@vigilant-broccoli/react-lib`, shared by `CheckList` rows and `react-lib-higher-level`'s `CRUDItemList`.

## Props

- `actions` — `EllipsisAction[]` (`label`, `onSelect`, optional `color`, `disabled`, `confirm`); replaces the Update/Delete shorthand.
- `onUpdate`, `onDelete` — shorthand for an Update entry and a confirmed red Delete entry; `deleteDisabled`, `confirmTitle`, `confirmDescription`, `updateLabel`, `deleteLabel` tune them.
- `icon` — `ellipsis-horizontal` (default) or `ellipsis-vertical`; `disabled` disables the trigger.

## Behavior

- An action with `confirm` opens `DeleteItemConfirmationDialog`, which awaits `onSelect` before closing.
- The menu is non-modal: a modal menu handing off to a dialog leaves `pointer-events: none` on `<body>` after the dialog closes.
- The wrapper stops click propagation so row click handlers do not fire.
