'use client';

import {
  type Board,
  KanbanBoards,
  type KanbanState,
  type KanbanStore,
  type SortMode,
  createRemoteKanbanStore,
} from '@vigilant-broccoli/react-lib-tasks';
import { authFetch, googleTasksAuth } from '../../../libs/auth';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { TaskVoiceButton } from './task-voice-button.component';

// Board setup once lived in localStorage; it is copied to the store on first load.
const STORAGE_KEY_BOARDS = 'swimlanes-boards';
const STORAGE_KEY_ACTIVE_BOARD = 'swimlanes-active-board';
const SORT_MODE_KEY_PREFIX = 'google-tasks-sort-mode-';

const readLocalSortModes = (): Record<string, SortMode> => {
  const sortModes: Record<string, SortMode> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(SORT_MODE_KEY_PREFIX)) {
      const taskListId = key.slice(SORT_MODE_KEY_PREFIX.length);
      const value = localStorage.getItem(key);
      if (value) sortModes[taskListId] = value as SortMode;
    }
  }
  return sortModes;
};

const readLocalBoards = (): KanbanState | null => {
  const storedBoards = localStorage.getItem(STORAGE_KEY_BOARDS);
  if (!storedBoards) return null;
  const boards: Board[] = JSON.parse(storedBoards);
  if (boards.length === 0) return null;
  const storedActiveBoard = localStorage.getItem(STORAGE_KEY_ACTIVE_BOARD);
  return {
    boards,
    activeBoardId: storedActiveBoard || boards[0].id,
    sortModes: readLocalSortModes(),
  };
};

const clearLocalBoards = () => {
  localStorage.removeItem(STORAGE_KEY_BOARDS);
  localStorage.removeItem(STORAGE_KEY_ACTIVE_BOARD);
  Object.keys(localStorage)
    .filter(key => key.startsWith(SORT_MODE_KEY_PREFIX))
    .forEach(key => localStorage.removeItem(key));
};

const kanbanStore: KanbanStore = {
  ...createRemoteKanbanStore({
    authFetch,
    url: API_ENDPOINTS.KANBAN_BOARDS,
  }),
  legacy: { read: readLocalBoards, clear: clearLocalBoards },
};

export const KanbanComponent = () => (
  <KanbanBoards
    auth={googleTasksAuth}
    store={kanbanStore}
    renderVoiceAction={onTranscript => (
      <TaskVoiceButton onTranscript={onTranscript} />
    )}
  />
);
