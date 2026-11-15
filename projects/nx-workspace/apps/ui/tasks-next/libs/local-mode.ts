import { useSyncExternalStore } from 'react';
import {
  STORAGE_KEY_SELECTED_TASK_LIST,
  createLocalTasksAdapter,
} from '@vigilant-broccoli/react-lib-tasks';
import { signInWithGoogle } from './auth';

const LOCAL_MODE_KEY = 'tasks-local-mode';
const LOCAL_TASKS_KEY = 'tasks-local-store';
const LOCAL_MODE_ENABLED = 'true';

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const isLocalMode = () =>
  localStorage.getItem(LOCAL_MODE_KEY) === LOCAL_MODE_ENABLED;

export const setLocalMode = (enabled: boolean) => {
  if (enabled) localStorage.setItem(LOCAL_MODE_KEY, LOCAL_MODE_ENABLED);
  else localStorage.removeItem(LOCAL_MODE_KEY);
  // Local and Google list ids differ; a carried-over id fails Google's lookup.
  localStorage.removeItem(STORAGE_KEY_SELECTED_TASK_LIST);
  listeners.forEach(listener => listener());
};

// The server snapshot is false, so local mode applies after hydration.
export const useLocalMode = () =>
  useSyncExternalStore(subscribe, isLocalMode, () => false);

// Leaves local mode first so the Google session takes over on return. Local
// tasks stay in this browser and reappear if local mode is chosen again.
export const signInFromLocalMode = async () => {
  setLocalMode(false);
  await signInWithGoogle();
};

export const localTasksAuth = createLocalTasksAdapter({
  storageKey: LOCAL_TASKS_KEY,
  signInWithGoogle: signInFromLocalMode,
});
