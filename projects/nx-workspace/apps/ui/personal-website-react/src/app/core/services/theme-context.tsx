import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  type ReactNode,
} from 'react';
import {
  useThemePreference,
  useToggleThemeKeybind,
} from '@vigilant-broccoli/react-lib';

const DARK = 'dark';
const THEME_STORAGE_KEY = 'personal-website-react-theme';

export const DARK_MODE_LABELS = {
  toLight: 'Switch to light mode',
  toDark: 'Switch to dark mode',
} as const;

type ThemeContextValue = {
  isDark: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  toggleDarkMode: () => undefined,
});

export const useTheme = () => useContext(ThemeContext);

// The site styles html/body with `dark:` classes, so the class goes on the
// document root rather than react-lib's ThemeScope wrapper.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { appearance, toggleTheme } = useThemePreference(THEME_STORAGE_KEY);
  const isDark = appearance === DARK;
  useToggleThemeKeybind(toggleTheme);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle(DARK, isDark);
  }, [isDark]);

  const value = useMemo(
    () => ({ isDark, toggleDarkMode: toggleTheme }),
    [isDark, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
