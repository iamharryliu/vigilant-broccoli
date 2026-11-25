import { createLocalTasksAdapter } from '@vigilant-broccoli/react-lib-tasks';
import { signInWithGoogle } from './auth';
import { STORAGE_MODE, setStorageMode, useStorageMode } from './storage-mode';

const LOCAL_TASKS_KEY = 'tasks-local-store';

// Leaving local mode returns to Google Tasks.
export const setLocalMode = (enabled: boolean) =>
  setStorageMode(enabled ? STORAGE_MODE.LOCAL : STORAGE_MODE.GOOGLE);

export const useLocalMode = () => useStorageMode() === STORAGE_MODE.LOCAL;

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
