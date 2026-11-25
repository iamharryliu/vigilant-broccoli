import {
  type KanbanState,
  type KanbanStore,
  createRemoteKanbanStore,
} from '@vigilant-broccoli/react-lib-tasks';
import { API_ENDPOINT } from '../src/app/app.const';
import { authFetch } from './auth';
import { parentSessionTasksAuth } from './parent-session';
import { STORAGE_MODE, type StorageMode } from './storage-mode';

const LOCAL_BOARDS_KEY = 'tasks-kanban-boards';

const localKanbanStore: KanbanStore = {
  load: async () => {
    const saved = localStorage.getItem(LOCAL_BOARDS_KEY);
    return {
      ok: true,
      state: saved ? (JSON.parse(saved) as KanbanState) : null,
    };
  },
  save: async state => {
    localStorage.setItem(LOCAL_BOARDS_KEY, JSON.stringify(state));
    return true;
  },
};

// Google and Database modes both keep their boards in Supabase, one row each:
// the two stores have different task list ids.
const createModeKanbanStore = (
  store: StorageMode,
  fetcher: typeof authFetch = authFetch,
) =>
  createRemoteKanbanStore({
    authFetch: fetcher,
    url: `${API_ENDPOINT.KANBAN_BOARDS}?${new URLSearchParams({ store })}`,
  });

export const GOOGLE_KANBAN_STORE = createModeKanbanStore(STORAGE_MODE.GOOGLE);

// /embed/board?session=parent: requests carry the embedding page's token.
export const PARENT_SESSION_GOOGLE_KANBAN_STORE = createModeKanbanStore(
  STORAGE_MODE.GOOGLE,
  parentSessionTasksAuth.authFetch,
);

// Module-level so each mode's store keeps one identity: the board reloads when
// its store changes.
export const KANBAN_STORE_BY_MODE: Record<StorageMode, KanbanStore> = {
  [STORAGE_MODE.GOOGLE]: GOOGLE_KANBAN_STORE,
  [STORAGE_MODE.DATABASE]: createModeKanbanStore(STORAGE_MODE.DATABASE),
  [STORAGE_MODE.LOCAL]: localKanbanStore,
};
