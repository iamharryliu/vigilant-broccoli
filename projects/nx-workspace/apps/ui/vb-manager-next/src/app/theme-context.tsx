'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeAppearance = 'light' | 'dark';

interface ThemeContextType {
  appearance: ThemeAppearance;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearance] = useState<ThemeAppearance>('light');

  // Load theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme') as ThemeAppearance | null;
    if (saved === 'light' || saved === 'dark') {
      setAppearance(saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = appearance === 'light' ? 'dark' : 'light';
    setAppearance(next);
    localStorage.setItem('theme', next);
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
