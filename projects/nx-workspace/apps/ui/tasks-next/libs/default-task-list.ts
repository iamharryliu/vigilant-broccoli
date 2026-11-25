import { useSyncExternalStore } from 'react';
import { STORAGE_KEY_SELECTED_TASK_LIST } from '@vigilant-broccoli/react-lib-tasks';
import { STORAGE_MODE, type StorageMode } from './storage-mode';

// Each mode's list ids differ, so each keeps its own default.
const DEFAULT_LIST_KEY: Record<StorageMode, string> = {
  [STORAGE_MODE.GOOGLE]: 'tasks-default-list-id',
  [STORAGE_MODE.LOCAL]: 'tasks-default-list-id-local',
  [STORAGE_MODE.DATABASE]: 'tasks-default-list-id-database',
};

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const readDefaultTaskListId = (mode: StorageMode) =>
  localStorage.getItem(DEFAULT_LIST_KEY[mode]);

export const setDefaultTaskListId = (
  mode: StorageMode,
  taskListId: string | null,
) => {
  if (taskListId) localStorage.setItem(DEFAULT_LIST_KEY[mode], taskListId);
  else localStorage.removeItem(DEFAULT_LIST_KEY[mode]);
  listeners.forEach(listener => listener());
};

// Null until the user picks one; the first list (Google's default) applies then.
export const useDefaultTaskListId = (mode: StorageMode) =>
  useSyncExternalStore(
    subscribe,
    () => readDefaultTaskListId(mode),
    () => null,
  );

// The component restores its last-used list from this key on mount, so writing
// the default there opens the app on it. A default that no longer exists falls
// back to Google's default list inside the component.
export const applyDefaultTaskList = (mode: StorageMode) => {
  if (typeof window === 'undefined') return;
  const defaultId = readDefaultTaskListId(mode);
  if (defaultId)
    localStorage.setItem(STORAGE_KEY_SELECTED_TASK_LIST, defaultId);
};
