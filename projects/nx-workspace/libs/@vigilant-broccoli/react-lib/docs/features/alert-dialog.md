# Alert Dialog

- Shared confirmation dialog for actions that need an explicit decision.

## Usage

- Compose `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, and `AlertDialogAction` from the public library barrel.
- Use `asChild` on trigger, cancel, and action to compose with `Button`; use its `destructive` variant for destructive actions and `outline` for cancel.
- Supply translated title, description, and button labels from the consuming app.
- `AlertDialogContent` includes a portal and overlay; `fullScreenOnMobile` matches the existing dialog's mobile layout.

## Behavior

- Opening focuses Cancel by default, traps keyboard focus, and announces the title and description with `role="alertdialog"`.
- Clicking outside does not dismiss the dialog; Cancel or Escape dismisses it and restores focus to the trigger.
- Action closes the dialog immediately and only runs the callback the caller supplies; dismissal never runs that callback.
- For asynchronous confirmation, control `open`/`onOpenChange`, prevent the action click's default behavior, and close only after success; callers own loading, disabled, and error states.
- Do not use `Button`'s automatic async loading alone to delay dismissal: the action primitive closes on click unless default is prevented.
- The component gallery includes a harmless confirmation counter under Alert Dialog.
- Existing CRUD list deletion and the manager's confirmation dialog use this shared component.
- `DeleteItemConfirmationDialog` accepts `cancelLabel`, stays open during async deletion, and closes after success in both controlled and uncontrolled modes.
