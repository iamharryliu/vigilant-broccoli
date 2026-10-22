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
import { useToggleThemeKeybind } from '../hooks/useThemeKeybind';

const USE_THEME_ERROR = 'useTheme must be used within a ThemeProvider';

type ThemeContextType = {
  appearance: ThemeAppearance;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  style,
  storageKey,
  keybind = true,
}: {
  children: ReactNode;
  style?: CSSProperties;
  /** Per-app `localStorage` key for the saved override. */
  storageKey?: string;
  /** Binds the global `d` toggle; disable it where `d` is taken and call `useThemeKeybind` where it is free. */
  keybind?: boolean;
}) {
  const { appearance, toggleTheme } = useThemePreference(storageKey);
  useToggleThemeKeybind(toggleTheme, keybind);

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

export function useThemeKeybind(enabled = true) {
  useToggleThemeKeybind(useTheme().toggleTheme, enabled);
}
