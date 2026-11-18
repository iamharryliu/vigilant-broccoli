# Dialog

- Shared modal dialog for forms, details, and utility panels.

## Usage

- Compose `Dialog`, `DialogTrigger`, `DialogContent`, `DialogTitle`, `DialogDescription`, and `DialogClose` from the public library barrel; use `asChild` on triggers and close controls that wrap a button.
- Every dialog, including `AlertDialog`, keeps rounded corners and a 0.5rem gutter on phones (`w-[calc(100%-1rem)]`), so it never sits edge to edge; `fullScreenOnMobile` and the image carousel use the same inset.
- `DialogContent` supplies the body portal, overlay, and close icon; set `showCloseButton={false}` when the caller supplies its own dismissal controls.
- Use `fullScreenOnMobile` or `FULL_SCREEN_ON_MOBILE_DIALOG_CLASS` for a near-full-screen phone layout (inset by 0.5rem so the rounded corners still mark it as a dialog); constrain height and enable scrolling for long desktop forms.
- Without extra props a dialog never grows past the viewport (`max-h-[calc(100dvh-1rem)]`) and scrolls as a whole, close button included. For long content pass `scrollable` and put the middle in `DialogBody`: `DialogHeader`, `DialogFooter` and the close button stay pinned while only the body scrolls. A `<form>` wrapping all three takes `flex min-h-0 flex-1 flex-col gap-4`. `DialogHeader` is left-aligned and reserves right padding for the close button, which sits at the content's top-right (`top-6 right-6`, one title line tall) so it centers on the first title line.
- Provide a translated title, visually hidden when needed; omit `DialogDescription` and pass `aria-describedby={undefined}` when the dialog has no description.
- Controlled callers own `open`/`onOpenChange` and close after successful asynchronous work; trigger-based dialogs restore focus to the trigger unless the caller overrides `onCloseAutoFocus`.

## Migration constraints

- Body portals mirror the originating DOM scope's dark class and inherited CSS variables, including ancestor attribute changes while open; controlled dialogs without a trigger receive the same treatment.
- ThemeScope supplies the small set of legacy color tokens used by utility content; dialog rendering does not import Radix Themes.
- Former Themes dialogs use block layout, preserve their widths/title spacing and existing close controls, and explicitly opt out of the shared close icon.
