'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  ReactNode,
  type CSSProperties,
} from 'react';

import { ThemeScope } from './ThemeScope';

const LIGHT = 'light';
const DARK = 'dark';
const THEME_STORAGE_KEY = 'theme';
const USE_THEME_ERROR = 'useTheme must be used within a ThemeProvider';
const STORAGE_EVENT = 'storage';
const CHANGE_EVENT = 'change';
const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)';

export type ThemeAppearance = typeof LIGHT | typeof DARK;

type ThemeContextType = {
  appearance: ThemeAppearance;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const isAppearance = (value: unknown): value is ThemeAppearance =>
  value === LIGHT || value === DARK;

const getSystemAppearance = (): ThemeAppearance =>
  typeof window !== 'undefined' &&
  window.matchMedia?.(PREFERS_DARK_QUERY).matches
    ? DARK
    : LIGHT;

export function ThemeProvider({
  children,
  style,
  followSystem = false,
}: {
  children: ReactNode;
  style?: CSSProperties;
  /** Track `prefers-color-scheme` live; ignores the stored override and cross-tab sync. */
  followSystem?: boolean;
}) {
  const [appearance, setAppearance] = useState<ThemeAppearance>(
    followSystem ? getSystemAppearance : LIGHT,
  );

  useEffect(() => {
    if (!followSystem) return;
    const media = window.matchMedia?.(PREFERS_DARK_QUERY);
    if (!media) return;
    const sync = () => setAppearance(media.matches ? DARK : LIGHT);
    sync();
    media.addEventListener(CHANGE_EVENT, sync);
    return () => media.removeEventListener(CHANGE_EVENT, sync);
  }, [followSystem]);

  useLayoutEffect(() => {
    if (followSystem) return;
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (isAppearance(saved)) {
      setAppearance(saved);
    }
  }, [followSystem]);

  useEffect(() => {
    if (followSystem) return;
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && isAppearance(e.newValue)) {
        setAppearance(e.newValue);
      }
    };

    window.addEventListener(STORAGE_EVENT, handleStorageChange);
    return () => window.removeEventListener(STORAGE_EVENT, handleStorageChange);
  }, [followSystem]);

  const toggleTheme = () => {
    if (followSystem) return;
    const next: ThemeAppearance = appearance === LIGHT ? DARK : LIGHT;
    setAppearance(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  };

  return (
    <ThemeContext.Provider value={{ appearance, toggleTheme }}>
      <ThemeScope appearance={appearance} style={style}>
        {children}
      </ThemeScope>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error(USE_THEME_ERROR);
  }
  return context;
}
