import { useEffect, useState } from 'react';
import { OPEN_TYPE, type QuickLink } from '@vigilant-broccoli/common-js';

const STORAGE_KEY = 'bookmarks:v1';
type StoredState = { bookmarks: QuickLink[] };
const EMPTY_STATE: StoredState = { bookmarks: [] };
const INVALID_BOOKMARK = 'Invalid bookmark';
// Emitted at build time by scripts/generate-default-bookmarks.ts. Self-hosters replace the served
// file (e.g. a Docker volume mount) to ship their own list without rebuilding.
const DEFAULT_BOOKMARKS_URL = `${import.meta.env.BASE_URL}default-bookmarks.json`;

export function parseBookmarks(value: unknown): QuickLink[] {
  if (!Array.isArray(value)) throw new Error(INVALID_BOOKMARK);
  return value.map(item => {
    if (
      !item ||
      typeof item !== 'object' ||
      typeof item.label !== 'string' ||
      !item.label.trim() ||
      typeof item.target !== 'string' ||
      item.type !== OPEN_TYPE.BROWSER ||
      (item.subgroup !== undefined && typeof item.subgroup !== 'string') ||
      item.embed !== undefined ||
      item.args !== undefined
    ) {
      throw new Error(INVALID_BOOKMARK);
    }
    const target = item.target.trim();
    const url = new URL(target);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error(INVALID_BOOKMARK);
    }
    return {
      label: item.label.trim(),
      target,
      type: OPEN_TYPE.BROWSER,
      ...(item.subgroup?.trim() ? { subgroup: item.subgroup.trim() } : {}),
    };
  });
}

export async function fetchDefaultBookmarks(): Promise<QuickLink[]> {
  const response = await fetch(DEFAULT_BOOKMARKS_URL, { cache: 'no-cache' });
  if (!response.ok) throw new Error(INVALID_BOOKMARK);
  return parseBookmarks(await response.json());
}

function readState(): StoredState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // A missing key means first visit; a cleared list is stored as [] and must not be re-seeded.
    if (!raw) return null;
    const stored = JSON.parse(raw);
    return {
      bookmarks: parseBookmarks(stored.bookmarks),
    };
  } catch {
    return EMPTY_STATE;
  }
}

export function useBookmarks() {
  const [stored] = useState(readState);
  const [state, setState] = useState(stored ?? EMPTY_STATE);
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(stored === null);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    if (stored !== null) return;
    let isCancelled = false;
    fetchDefaultBookmarks()
      .then(bookmarks => {
        if (!isCancelled) setState({ bookmarks });
      })
      .catch(() => undefined)
      .finally(() => {
        if (!isCancelled) setIsLoadingDefaults(false);
      });
    return () => {
      isCancelled = true;
    };
  }, [stored]);
  const save = (next: StoredState) => {
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  };
  return {
    ...state,
    storageError,
    isLoadingDefaults,
    setBookmarks: (bookmarks: QuickLink[]) => save({ ...state, bookmarks }),
  };
}
