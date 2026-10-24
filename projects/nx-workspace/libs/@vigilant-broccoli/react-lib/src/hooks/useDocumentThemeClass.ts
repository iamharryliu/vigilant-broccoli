'use client';

import { useLayoutEffect } from 'react';
import { useToggleThemeKeybind } from './useThemeKeybind';
import { useThemePreference } from './useThemePreference';

const DARK = 'dark';

// For apps whose palette hangs off `<html>` (document styles, fixed backdrops,
// `:root` variables) that a ThemeScope wrapper would cover or shadow.
// `colorScheme` follows the appearance so scrollbars and overscroll match
// in-session toggles, not just the no-flash head script.
export function useDocumentThemeClass(
  storageKey: string,
  { keybind = true }: { keybind?: boolean } = {},
) {
  const { appearance, toggleTheme } = useThemePreference(storageKey);
  useToggleThemeKeybind(toggleTheme, keybind);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle(DARK, appearance === DARK);
    root.style.colorScheme = appearance;
  }, [appearance]);

  return { appearance, toggleTheme };
}
