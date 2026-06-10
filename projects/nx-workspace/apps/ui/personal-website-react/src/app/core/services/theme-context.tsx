import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const THEME_STORAGE_KEY = 'theme';
const DARK = 'dark';
const LIGHT = 'light';

type Theme = typeof DARK | typeof LIGHT;

type ThemeContextValue = {
  theme: Theme;
  isDark: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: LIGHT,
  isDark: false,
  toggleDarkMode: () => undefined,
});

export const useTheme = () => useContext(ThemeContext);

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return LIGHT;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === DARK || stored === LIGHT) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? DARK
    : LIGHT;
};

const IGNORED_TAG_NAMES = ['INPUT', 'TEXTAREA', 'SELECT'];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === DARK) root.classList.add(DARK);
    else root.classList.remove(DARK);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleDarkMode = useCallback(() => {
    setTheme(prev => (prev === DARK ? LIGHT : DARK));
  }, []);

  useEffect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'd') return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
        return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (
        IGNORED_TAG_NAMES.includes(target.tagName) ||
        target.isContentEditable
      )
        return;
      toggleDarkMode();
    };
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [toggleDarkMode]);

  const value = useMemo(
    () => ({ theme, isDark: theme === DARK, toggleDarkMode }),
    [theme, toggleDarkMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
