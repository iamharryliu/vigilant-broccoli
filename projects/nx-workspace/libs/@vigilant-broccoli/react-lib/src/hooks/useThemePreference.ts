'use client';

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

const LIGHT = 'light';
const DARK = 'dark';
export const THEME_STORAGE_KEY = 'theme';
const STORAGE_EVENT = 'storage';
const CHANGE_EVENT = 'change';
const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)';

export type ThemeAppearance = typeof LIGHT | typeof DARK;

const isAppearance = (value: unknown): value is ThemeAppearance =>
  value === LIGHT || value === DARK;

const readStoredAppearance = (storageKey: string): ThemeAppearance | null => {
  try {
    const saved = localStorage.getItem(storageKey);
    return isAppearance(saved) ? saved : null;
  } catch {
    return null;
  }
};

// Starts light and resolves in a layout effect so server and client renders
// match; client-only apps resolve before first paint.
export function useSystemAppearance(): ThemeAppearance {
  const [appearance, setAppearance] = useState<ThemeAppearance>(LIGHT);

  useLayoutEffect(() => {
    const media = window.matchMedia?.(PREFERS_DARK_QUERY);
    if (!media) return;
    const sync = () => setAppearance(media.matches ? DARK : LIGHT);
    sync();
    media.addEventListener(CHANGE_EVENT, sync);
    return () => media.removeEventListener(CHANGE_EVENT, sync);
  }, []);

  return appearance;
}

/**
 * Follows `prefers-color-scheme` live unless the user toggled to the opposite appearance.
 * Apps sharing an origin (GitHub Pages subpaths) pass their own `storageKey` so
 * one app's override does not leak into another.
 */
export function useThemePreference(storageKey = THEME_STORAGE_KEY) {
  const systemAppearance = useSystemAppearance();
  const [override, setOverride] = useState<ThemeAppearance | null>(null);
  const appearance = override ?? systemAppearance;

  useLayoutEffect(() => {
    setOverride(readStoredAppearance(storageKey));
  }, [storageKey]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey) setOverride(readStoredAppearance(storageKey));
    };
    window.addEventListener(STORAGE_EVENT, handleStorageChange);
    return () => window.removeEventListener(STORAGE_EVENT, handleStorageChange);
  }, [storageKey]);

  const toggleTheme = useCallback(() => {
    const next: ThemeAppearance = appearance === LIGHT ? DARK : LIGHT;
    // Toggling back to the system appearance clears the override, so later
    // OS changes apply again.
    setOverride(next === systemAppearance ? null : next);
    try {
      if (next === systemAppearance) localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, next);
    } catch {
      // Keep the in-memory preference when browser storage is unavailable.
    }
  }, [appearance, systemAppearance, storageKey]);

  return { appearance, toggleTheme };
}
