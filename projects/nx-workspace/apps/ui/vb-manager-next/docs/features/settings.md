# Settings

## Overview

- Accessible via the "Settings" item in the right sidebar (above Sign In/Out)
- Route: `/settings`
- Contains a dark mode toggle button and the keyboard shortcuts cheatsheet

## Dark Mode Toggle

- Button at the top of the settings page, using `useTheme()` from `@vigilant-broccoli/react-lib`
- Label/icon flip between "Dark mode" (Moon icon) and "Light mode" (Sun icon) depending on `appearance`
- The `d` global keyboard shortcut (`src/app/(pages)/layout.tsx`) still toggles the same theme state independently of this button

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
- Page: `src/app/components/pages/SettingsPage.tsx` (dark mode toggle + keyboard shortcuts cheatsheet)
- Overlay: `src/app/components/shortcuts-overlay.component.tsx`
- Overlay keybinding: `src/app/(pages)/layout.tsx`
- Shortcuts content: `src/app/content/keyboard-shortcuts.md.ts`

## Maintenance

- Global keyboard shortcuts are handled in `src/app/(pages)/layout.tsx` (`processKeyboardInput`), and the hold-`?` overlay binding lives further down in the same file's keydown/keyup effect
- Whenever a shortcut is added, changed, or removed in either place, update `KEYBOARD_SHORTCUTS_MARKDOWN` in `src/app/content/keyboard-shortcuts.md.ts` to match
