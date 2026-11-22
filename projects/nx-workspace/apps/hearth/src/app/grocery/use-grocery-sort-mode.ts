import { useEffect, useState } from 'react';
import {
  GROCERY_SORT_MODE,
  type GrocerySortMode,
} from './grocery-sections.consts';

const getStorageKey = (prefix: string) => `${prefix}-sort-mode`;

export const useGrocerySortMode = (storageKeyPrefix: string) => {
  const [sortMode, setSortMode] = useState<GrocerySortMode>(() => {
    try {
      const saved = localStorage.getItem(getStorageKey(storageKeyPrefix));
      if (saved === GROCERY_SORT_MODE.STORE_SECTION) return saved;
    } catch {
      // Storage can be unavailable (private mode); the default sort still works.
    }
    return GROCERY_SORT_MODE.DEFAULT;
  });

  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey(storageKeyPrefix), sortMode);
    } catch {
      // See above.
    }
  }, [sortMode, storageKeyPrefix]);

  return [sortMode, setSortMode] as const;
};
