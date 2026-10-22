'use client';

import {
  createContext,
  useContext,
  useLayoutEffect,
  useSyncExternalStore,
  ReactNode,
  type CSSProperties,
} from 'react';

import { getThemeRestoreScript, ThemeScope } from './ThemeScope';
import {
  THEME_STORAGE_KEY,
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

const subscribeNever = () => () => undefined;

// True for server and hydration renders, false for client-created trees: React
// never executes scripts it creates on the client and warns about them in Next.
const useIsServerRendered = () =>
  useSyncExternalStore(
    subscribeNever,
    () => false,
    () => true,
  );

export function ThemeProvider({
  children,
  style,
  storageKey = THEME_STORAGE_KEY,
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
  const isServerRendered = useIsServerRendered();

  // The scope only covers its own box, so scrollbars and overscroll follow the
  // root. A client-only effect leaves server markup untouched (no hydration
  // mismatch); it runs before first paint, after the head/restore scripts.
  useLayoutEffect(() => {
    document.documentElement.style.colorScheme = appearance;
  }, [appearance]);

  return (
    <ThemeContext.Provider value={{ appearance, toggleTheme }}>
      {/* The restore script rewrites the server-rendered scope before hydration. */}
      <ThemeScope
        appearance={appearance}
        style={style}
        suppressHydrationWarning
      >
        {isServerRendered && (
          <script
            dangerouslySetInnerHTML={{
              __html: getThemeRestoreScript(storageKey, style),
            }}
          />
        )}
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
