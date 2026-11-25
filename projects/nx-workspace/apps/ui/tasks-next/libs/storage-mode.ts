import { useSyncExternalStore } from 'react';
import { STORAGE_KEY_SELECTED_TASK_LIST } from '@vigilant-broccoli/react-lib-tasks';

export const STORAGE_MODE = {
  GOOGLE: 'google',
  LOCAL: 'local',
  DATABASE: 'database',
} as const;
export type StorageMode = (typeof STORAGE_MODE)[keyof typeof STORAGE_MODE];

const STORAGE_MODE_KEY = 'tasks-storage-mode';
// Written before Database mode existed, when local mode was a boolean flag.
const LEGACY_LOCAL_MODE_KEY = 'tasks-local-mode';
const LEGACY_LOCAL_MODE_ENABLED = 'true';

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const isStorageMode = (value: string | null): value is StorageMode =>
  Object.values<string>(STORAGE_MODE).includes(value ?? '');

const readStorageMode = (): StorageMode => {
  const saved = localStorage.getItem(STORAGE_MODE_KEY);
  if (isStorageMode(saved)) return saved;
  return localStorage.getItem(LEGACY_LOCAL_MODE_KEY) ===
    LEGACY_LOCAL_MODE_ENABLED
    ? STORAGE_MODE.LOCAL
    : STORAGE_MODE.GOOGLE;
};

export const setStorageMode = (mode: StorageMode) => {
  localStorage.setItem(STORAGE_MODE_KEY, mode);
  localStorage.removeItem(LEGACY_LOCAL_MODE_KEY);
  // Each mode has its own list ids; a carried-over id fails Google's lookup.
  localStorage.removeItem(STORAGE_KEY_SELECTED_TASK_LIST);
  listeners.forEach(listener => listener());
};

// The server snapshot is Google, so the stored mode applies after hydration.
export const useStorageMode = () =>
  useSyncExternalStore(subscribe, readStorageMode, () => STORAGE_MODE.GOOGLE);
