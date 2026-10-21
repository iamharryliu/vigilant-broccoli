import { useState } from 'react';
import { OPEN_TYPE, type QuickLink } from '@vigilant-broccoli/common-js';

const STORAGE_KEY = 'bookmarks:v1';
export const TAB = { BOOKMARKS: 'bookmarks', MANAGE: 'manage' } as const;
type Tab = (typeof TAB)[keyof typeof TAB];
type StoredState = { bookmarks: QuickLink[]; tab: Tab };
const EMPTY_STATE: StoredState = { bookmarks: [], tab: TAB.BOOKMARKS };
const INVALID_BOOKMARK = 'Invalid bookmark';

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

function readState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const stored = JSON.parse(raw);
    return {
      bookmarks: parseBookmarks(stored.bookmarks),
      tab: stored.tab === TAB.MANAGE ? TAB.MANAGE : TAB.BOOKMARKS,
    };
  } catch {
    return EMPTY_STATE;
  }
}

export function useBookmarks() {
  const [state, setState] = useState(readState);
  const [storageError, setStorageError] = useState(false);
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
    setBookmarks: (bookmarks: QuickLink[]) => save({ ...state, bookmarks }),
    setTab: (tab: string) =>
      save({ ...state, tab: tab === TAB.MANAGE ? TAB.MANAGE : TAB.BOOKMARKS }),
  };
}
