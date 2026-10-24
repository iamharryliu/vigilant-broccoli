import { createContext, useContext, type ReactNode } from 'react';
import {
  useDocumentThemeClass,
  type ThemeAppearance,
} from '@vigilant-broccoli/react-lib';

const THEME_STORAGE_KEY = 'pages-index-theme';

const AppearanceContext = createContext<ThemeAppearance>('light');

export const useAppearance = () => useContext(AppearanceContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { appearance } = useDocumentThemeClass(THEME_STORAGE_KEY);

  return (
    <AppearanceContext.Provider value={appearance}>
      {children}
    </AppearanceContext.Provider>
  );
}
