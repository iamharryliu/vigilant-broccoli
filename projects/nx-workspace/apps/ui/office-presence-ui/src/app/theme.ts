import { useLayoutEffect } from 'react';
import {
  useThemePreference,
  useToggleThemeKeybind,
} from '@vigilant-broccoli/react-lib';

const DARK = 'dark';
const THEME_STORAGE_KEY = 'office-presence-ui-theme';

// The Slack-style palette is plain CSS keyed off `:root.dark`, so the class
// goes on the document root rather than react-lib's ThemeScope wrapper.
export function useDocumentTheme() {
  const { appearance, toggleTheme } = useThemePreference(THEME_STORAGE_KEY);
  useToggleThemeKeybind(toggleTheme);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle(DARK, appearance === DARK);
  }, [appearance]);
}
