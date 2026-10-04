# Dialog

- Shared modal dialog for forms, details, and utility panels.

## Usage

- Compose `Dialog`, `DialogTrigger`, `DialogContent`, `DialogTitle`, `DialogDescription`, and `DialogClose` from the public library barrel; use `asChild` on triggers and close controls that wrap a button.
- `DialogContent` supplies the body portal, overlay, and close icon; set `showCloseButton={false}` when the caller supplies its own dismissal controls.
- Use `fullScreenOnMobile` or `FULL_SCREEN_ON_MOBILE_DIALOG_CLASS` for edge-to-edge phone layouts; constrain height and enable scrolling for long desktop forms.
- Provide a translated title, visually hidden when needed; omit `DialogDescription` and pass `aria-describedby={undefined}` when the dialog has no description.
- Controlled callers own `open`/`onOpenChange` and close after successful asynchronous work; trigger-based dialogs restore focus to the trigger unless the caller overrides `onCloseAutoFocus`.

## Migration constraints

- Body portals mirror the originating DOM scope's dark class and inherited CSS variables, including ancestor attribute changes while open; controlled dialogs without a trigger receive the same treatment.
- Existing Radix theme tokens remain available to legacy utility content during the remaining Theme migration; dialog rendering does not import Radix Themes.
- Former Themes dialogs use block layout, preserve their widths/title spacing and existing close controls, and explicitly opt out of the shared close icon.
