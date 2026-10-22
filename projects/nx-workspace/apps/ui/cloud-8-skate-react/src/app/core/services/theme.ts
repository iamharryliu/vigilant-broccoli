import { useLayoutEffect } from 'react';
import {
  useThemePreference,
  useToggleThemeKeybind,
} from '@vigilant-broccoli/react-lib';

const DARK = 'dark';
const THEME_STORAGE_KEY = 'cloud-8-skate-react-theme';

// The fixed sky canvas sits at -z-10, beneath any ThemeScope background, so
// the dark class goes on the document root instead of a wrapper.
export function useDocumentTheme() {
  const { appearance, toggleTheme } = useThemePreference(THEME_STORAGE_KEY);
  useToggleThemeKeybind(toggleTheme);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle(DARK, appearance === DARK);
  }, [appearance]);
}
