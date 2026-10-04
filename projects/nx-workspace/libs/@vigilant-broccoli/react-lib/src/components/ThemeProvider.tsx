'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  type CSSProperties,
} from 'react';

import { ThemeScope } from './ThemeScope';

const LIGHT = 'light';
const DARK = 'dark';
const THEME_STORAGE_KEY = 'theme';
const USE_THEME_ERROR = 'useTheme must be used within a ThemeProvider';
const STORAGE_EVENT = 'storage';

export type ThemeAppearance = typeof LIGHT | typeof DARK;

type ThemeContextType = {
  appearance: ThemeAppearance;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const isAppearance = (value: unknown): value is ThemeAppearance =>
  value === LIGHT || value === DARK;

export function ThemeProvider({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  const [appearance, setAppearance] = useState<ThemeAppearance>(LIGHT);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (isAppearance(saved)) {
      setAppearance(saved);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && isAppearance(e.newValue)) {
        setAppearance(e.newValue);
      }
    };

    window.addEventListener(STORAGE_EVENT, handleStorageChange);
    return () => window.removeEventListener(STORAGE_EVENT, handleStorageChange);
  }, []);

  const toggleTheme = () => {
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
