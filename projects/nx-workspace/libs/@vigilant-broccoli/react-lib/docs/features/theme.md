# Theme

## Appearance

- `ThemeProvider` owns the saved light/dark appearance and renders a `ThemeScope`; existing `useTheme` and keyboard shortcut consumers keep the same API.
- Saved appearance is restored in a layout effect before the first client paint, keeping the initial render compatible with server-rendered light HTML. Component-library avoids global color transitions so switches do not animate through intermediate gray colors; individual controls retain their hover and focus transitions.
- `ThemeProvider followSystem` is an opt-in mode (used by `docs-md`, `context-md` and `links-react`): the appearance is read from `prefers-color-scheme` on first render and tracks live media-query changes; the stored `theme` value, cross-tab sync and `toggleTheme` are ignored. Without the prop, default light, persisted override and cross-tab behavior are unchanged. New apps adopt it by default per the [UI app pattern](../../../../../../../docs/app-development/ui/ui-app-pattern.md#theme-system-lightdark).
- `ThemeScope` supports an explicit appearance for system-driven embedded views without replacing the surrounding application's theme context.
- Component-library's themed sandbox uses `useThemeKeybind`: press `d` to toggle appearance. The shortcut ignores inputs, textareas, selects, editable content and Ctrl/Command/Alt combinations.
- `ThemeScope` supplies the light/dark semantic color variables (`background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`) used by the shared Tailwind primitives. Apps retain their Tailwind Preflight reset and semantic color mappings; component-library consumes the scope defaults without duplicating the palette in app CSS.
- Semantic defaults live in `src/theme-tokens.json`. The workspace `tailwind.preset.cjs` supplies color mappings and base variables for consumers that previously lacked them, including non-scoped legacy apps. It follows each app's existing class/media dark-mode strategy and allows app CSS and explicit scope styles to override defaults.
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
