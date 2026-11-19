# Settings

## Overview

- Accessible via the "Settings" item in the right sidebar (above Sign In/Out)
- Route: `/settings`
- Contains the theme picker and the keyboard shortcuts cheatsheet

## Theme Picker

- react-lib's `ThemePreferenceControl` (System/Light/Dark) at the top of the settings page; System follows the OS and clears the saved override
- The global `d` shortcut, bound by react-lib's `ThemeProvider` in `src/app/layout.tsx`, toggles the same theme state; the choice persists as `vb-manager-next-theme` (retained across the app rename for saved-theme compatibility)

## Keyboard Shortcuts Cheatsheet

- Renders Markdown via `react-markdown`
- Content source of truth: `src/app/content/keyboard-shortcuts.md.ts` (`KEYBOARD_SHORTCUTS_MARKDOWN`)
- Two views of the same content:
  - Settings page (`src/app/components/pages/SettingsPage.tsx`) — permanent, navigated to via the sidebar
  - Hold-`?` overlay (`src/app/components/shortcuts-overlay.component.tsx`) — transient, shown while the `?` key is held anywhere outside a text input

## Hold-`?` Overlay

- Bound in `src/app/(pages)/layout.tsx`, keyed off `e.code === 'Slash'` (the physical key) rather than `e.key`, so it opens only with Shift held (`?`) and closes correctly regardless of whether Shift or `/` is released first
- Also closes on `window` `blur` (e.g. alt-tab) since no `keyup` fires in that case
- Implemented separately from the `processKeyboardInput` switch used for the other global shortcuts, since it needs both keydown (open) and keyup (close) handling

## Implementation

- Sidebar entry: `src/app/components/right-sidebar.component.tsx` (`Settings` icon, routes to `/settings`)
- Route: `src/app/(pages)/settings/page.tsx`
- Page: `src/app/components/pages/SettingsPage.tsx` (theme picker + keyboard shortcuts cheatsheet)
- Overlay: `src/app/components/shortcuts-overlay.component.tsx`
- Overlay keybinding: `src/app/(pages)/layout.tsx`
- Shortcuts content: `src/app/content/keyboard-shortcuts.md.ts`

## Maintenance

- Global keyboard shortcuts are handled in `src/app/(pages)/layout.tsx` (`processKeyboardInput`), and the hold-`?` overlay binding lives further down in the same file's keydown/keyup effect
- The search dialog's `/` comes from react-lib's [`useFocusSearchShortcut`](../../../../../libs/@vigilant-broccoli/react-lib/docs/features/focus-search-shortcut.md) in the same layout, not `processKeyboardInput`
- Whenever a shortcut is added, changed, or removed in either place, update `KEYBOARD_SHORTCUTS_MARKDOWN` in `src/app/content/keyboard-shortcuts.md.ts` to match
