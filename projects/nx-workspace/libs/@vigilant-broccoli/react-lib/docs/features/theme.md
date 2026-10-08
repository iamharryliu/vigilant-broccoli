# Theme

## Appearance

- `ThemeProvider` owns the saved light/dark appearance and renders a `ThemeScope`; existing `useTheme` and keyboard shortcut consumers keep the same API.
- `ThemeProvider followSystem` is an opt-in mode (used by `docs-md`, `context-md` and `links-react`): the appearance is read from `prefers-color-scheme` on first render and tracks live media-query changes; the stored `theme` value, cross-tab sync and `toggleTheme` are ignored. Without the prop, default light, persisted override and cross-tab behavior are unchanged. New apps adopt it by default per the [UI app pattern](../../../../../../../docs/app-development/ui/ui-app-pattern.md#theme-system-lightdark).
- `ThemeScope` supports an explicit appearance for system-driven embedded views without replacing the surrounding application's theme context.
- Apps retain their Tailwind Preflight reset and semantic color variables; the scope supplies only the legacy color, radius and shadow tokens still consumed by shared utilities.
- Portal components copy the originating scope's variables and dark class so open dialogs and popovers follow theme changes.

## Popover and Switch

- Popover triggers compose a single focusable child; closing with Escape restores trigger focus, and controlled callers can close on selection.
- Hearth's date picker closes after a complete range; pending invites use the same keyboard-accessible button as their popover trigger.
- Switch preserves controlled/uncontrolled checked state, disabled behavior and native form participation through the Radix primitive.
