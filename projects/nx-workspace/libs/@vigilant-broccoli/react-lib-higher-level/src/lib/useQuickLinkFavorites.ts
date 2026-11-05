'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'quick-links-favorites';

export const useQuickLinkFavorites = (enabled: boolean) => {
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const favoritesRef = useRef(favorites);

  const updateFavorites = useCallback((next: Set<string>) => {
    favoritesRef.current = next;
    setFavorites(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      // Favorite changes remain available for the current session.
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const readFavorites = () => {
      try {
        const value: unknown = JSON.parse(
          localStorage.getItem(STORAGE_KEY) ?? '[]',
        );
        if (
          Array.isArray(value) &&
          value.every(item => typeof item === 'string')
        ) {
          const next = new Set(value);
          favoritesRef.current = next;
          setFavorites(next);
        }
      } catch {
        // Keep an empty in-memory selection when browser storage is unavailable or invalid.
      }
    };
    readFavorites();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) readFavorites();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [enabled]);

  const toggleFavorite = useCallback(
    (id: string) => {
      const next = new Set(favoritesRef.current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      updateFavorites(next);
    },
    [updateFavorites],
  );

  return { favorites, toggleFavorite };
};
