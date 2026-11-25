import { useSyncExternalStore } from 'react';

export const VIEW_MODE = { LIST: 'list', BOARD: 'board' } as const;
export type ViewMode = (typeof VIEW_MODE)[keyof typeof VIEW_MODE];

const VIEW_MODE_KEY = 'tasks-view-mode';

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const readViewMode = (): ViewMode =>
  localStorage.getItem(VIEW_MODE_KEY) === VIEW_MODE.BOARD
    ? VIEW_MODE.BOARD
    : VIEW_MODE.LIST;

export const setViewMode = (mode: ViewMode) => {
  localStorage.setItem(VIEW_MODE_KEY, mode);
  listeners.forEach(listener => listener());
};

export const useViewMode = () =>
  useSyncExternalStore(subscribe, readViewMode, () => VIEW_MODE.LIST);
