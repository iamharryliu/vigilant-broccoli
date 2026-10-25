import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useDocumentThemeClass } from '@vigilant-broccoli/react-lib';

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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { appearance, toggleTheme } = useDocumentThemeClass(THEME_STORAGE_KEY);
  const isDark = appearance === DARK;

  const value = useMemo(
    () => ({ isDark, toggleDarkMode: toggleTheme }),
    [isDark, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
