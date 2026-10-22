import {
  createContext,
  useContext,
  useLayoutEffect,
  type ReactNode,
} from 'react';
import {
  useThemePreference,
  useToggleThemeKeybind,
  type ThemeAppearance,
} from '@vigilant-broccoli/react-lib';

const DARK = 'dark';
const THEME_STORAGE_KEY = 'pages-index-theme';

const AppearanceContext = createContext<ThemeAppearance>('light');

export const useAppearance = () => useContext(AppearanceContext);

// The page palette lives in `:root` CSS variables that react-lib's ThemeScope
// would shadow, so the class goes on the document root instead.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { appearance, toggleTheme } = useThemePreference(THEME_STORAGE_KEY);
  useToggleThemeKeybind(toggleTheme);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle(DARK, appearance === DARK);
  }, [appearance]);

  return (
    <AppearanceContext.Provider value={appearance}>
      {children}
    </AppearanceContext.Provider>
  );
}
