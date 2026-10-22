# Theme

## Appearance

- `ThemeProvider` renders a `ThemeScope` from `useThemePreference`, which every app shares: with no saved override in `localStorage` the appearance follows `prefers-color-scheme` live, a manual toggle (`useTheme().toggleTheme`) saves an override, and toggling back to the system appearance clears it so later OS changes apply again. The saved value syncs across tabs. If browser storage is unavailable, the system appearance and in-memory overrides still work.
- The override is stored under `ThemeProvider`'s `storageKey` (default `theme`). Apps under `apps/ui` pass `<project>-theme` because several share the GitHub Pages origin.
- `useSystemAppearance` exposes the live media-query appearance alone (pages-index's ScrollTimeline), and `useToggleThemeKeybind` binds the `d` shortcut to any toggle, so apps that own their theme context (personal-website-react sets the `dark` class on `<html>`) reuse `useThemePreference` and it instead of duplicating them.
- Both values resolve in a layout effect before the first client paint, keeping the initial render compatible with server-rendered light HTML. Component-library avoids global color transitions so switches do not animate through intermediate gray colors; individual controls retain their hover and focus transitions.
- `ThemeScope` supports an explicit appearance for system-driven embedded views without replacing the surrounding application's theme context.
- `ThemeProvider` binds `d` to toggle appearance, so mounting it is enough. The shortcut ignores inputs, textareas, selects, editable content, Ctrl/Command/Alt combinations and keydowns another handler already `preventDefault`ed. Where `d` is taken, pass `keybind={false}` and call `useThemeKeybind(enabled)` below the provider only where it is free (balloono binds it on the home screen because `KeyD` steers in matches).
- `ThemeScope` supplies the light/dark semantic color variables (`background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`) used by the shared Tailwind primitives. Apps retain their Tailwind Preflight reset and semantic color mappings; component-library consumes the scope defaults without duplicating the palette in app CSS.
- Semantic defaults live in `src/theme-tokens.json`. The workspace `tailwind.preset.cjs` supplies color mappings and base variables for consumers that do not define their own, including non-scoped legacy apps. It follows each app's existing class/media dark-mode strategy and allows app CSS and explicit scope styles to override defaults.
- Cards, neutral badges and callouts, muted typography, switches and segmented controls use those semantic colors. Named status colors remain distinct. The blue/sky `accentColor` controls the legacy accent tokens used by embedded utilities; the semantic primary color keeps its light/dark neutral defaults.
- Code, skeletons, avatar fallbacks, lists, tables, sidebar navigation, copyable text, text editors and auth surfaces also use semantic neutral colors. Image-viewer/cropper backdrops and dialog scrims retain black or white for media contrast; named status and provider-brand colors remain independent.
- Pages-index's embedded ScrollTimeline explicitly maps its scope to the page's system-driven `--pages-background`, `--pages-primary` and `--pages-border` tokens so the page's custom palette survives scoped defaults.
- The scope also supplies legacy color, radius and shadow tokens consumed by shared utilities. Its text and panel colors reference the semantic foreground and card colors.
- Explicit light scopes reset semantic colors even inside a dark parent. Set CSS variables through `ThemeScope` or `ThemeProvider`'s `style` prop to customize a scope; these values take precedence over defaults. Palette variables defined only on an ancestor are superseded by the scope defaults.
- Dialog, AlertDialog, Popover, Select, Tooltip and DropdownMenu copy the originating scope's variables and dark class so open overlays follow theme changes. Caller styles take precedence where the content exposes a style prop.

## Popover and Switch

- Popover triggers compose a single focusable child; closing with Escape restores trigger focus, and controlled callers can close on selection.
- Hearth's date picker closes after a complete range; pending invites use the same keyboard-accessible button as their popover trigger.
- Switch preserves controlled/uncontrolled checked state, disabled behavior and native form participation through the Radix primitive.
