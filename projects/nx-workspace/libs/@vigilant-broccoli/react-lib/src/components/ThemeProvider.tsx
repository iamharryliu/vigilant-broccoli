'use client';

import {
  createContext,
  useContext,
  ReactNode,
  type CSSProperties,
} from 'react';

import { ThemeScope } from './ThemeScope';
import {
  useThemePreference,
  type ThemeAppearance,
} from '../hooks/useThemePreference';

const USE_THEME_ERROR = 'useTheme must be used within a ThemeProvider';

type ThemeContextType = {
  appearance: ThemeAppearance;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  const { appearance, toggleTheme } = useThemePreference();

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
