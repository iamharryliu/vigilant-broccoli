'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeAppearance = 'light' | 'dark';

interface ThemeContextType {
  appearance: ThemeAppearance;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearance] = useState<ThemeAppearance>('light');

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeAppearance | null;
    if (saved === 'light' || saved === 'dark') {
      setAppearance(saved);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
        setAppearance(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleTheme = () => {
    const next = appearance === 'light' ? 'dark' : 'light';
    setAppearance(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  };

  return (
    <ThemeContext.Provider value={{ appearance, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
