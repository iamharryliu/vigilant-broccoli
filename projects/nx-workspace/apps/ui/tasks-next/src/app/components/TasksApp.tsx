'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Kanban, List } from 'lucide-react';
import {
  IconButton,
  ToggleGroup,
  ToggleGroupItem,
} from '@vigilant-broccoli/react-lib';
import {
  GoogleTasksComponent,
  KanbanBoards,
} from '@vigilant-broccoli/react-lib-tasks';
import { tasksAuth, useAuthStatus } from '../../../libs/auth';
import { KANBAN_STORE_BY_MODE } from '../../../libs/kanban-store';
import { applyDefaultTaskList } from '../../../libs/default-task-list';
import { dbTasksAuth } from '../../../libs/db-tasks-auth';
import {
  localTasksAuth,
  setLocalMode,
  useLocalMode,
} from '../../../libs/local-mode';
import {
  STORAGE_MODE,
  type StorageMode,
  useStorageMode,
} from '../../../libs/storage-mode';
import {
  VIEW_MODE,
  type ViewMode,
  setViewMode,
  useViewMode,
} from '../../../libs/view-mode';
import { ROUTE } from '../app.const';
import { useTranslation } from '../i18n';
import { StorageModeSelect } from './StorageModeSelect';

// Track padding (3px per side) plus this height matches the Select's h-10.
const VIEW_ITEM_CLASS = 'h-[34px] px-2.5';

const AUTH_BY_MODE = {
  [STORAGE_MODE.GOOGLE]: tasksAuth,
  [STORAGE_MODE.LOCAL]: localTasksAuth,
  [STORAGE_MODE.DATABASE]: dbTasksAuth,
};

function TasksList({ mode, view }: { mode: StorageMode; view: ViewMode }) {
  // Runs before the list component's first render reads its remembered list.
  useState(() => applyDefaultTaskList(mode));
  // The board signs in on its own when signed out; the list shows its prompt.
  const isSignedIn = AUTH_BY_MODE[mode].useAuthStatus() === 'authenticated';
  if (view === VIEW_MODE.BOARD && isSignedIn) {
    return (
      <KanbanBoards
        auth={AUTH_BY_MODE[mode]}
        store={KANBAN_STORE_BY_MODE[mode]}
      />
    );
  }
  return (
    <GoogleTasksComponent
      auth={AUTH_BY_MODE[mode]}
      enableDragDrop
      enableVoiceInput={false}
      onUseLocally={() => setLocalMode(true)}
    />
  );
}

export function TasksApp() {
  const { t } = useTranslation();
  const router = useRouter();
  const mode = useStorageMode();
  const view = useViewMode();
  const isLocalMode = useLocalMode();
  const isAuthenticated = useAuthStatus() === 'authenticated';

  return (
    <main
      className={`mx-auto flex h-dvh flex-col gap-4 ${
        view === VIEW_MODE.BOARD ? 'max-w-none pt-4' : 'max-w-2xl p-4'
      }`}
    >
      <header
        className={`flex items-center justify-between ${
          view === VIEW_MODE.BOARD ? 'px-4' : ''
        }`}
      >
        <h1 className="text-xl font-semibold">{t('APP.NAME')}</h1>
        {(isAuthenticated || isLocalMode) && (
          <div className="flex items-center gap-1">
            <StorageModeSelect />
            <ToggleGroup
              label={t('VIEW.LABEL')}
              value={view}
              onValueChange={value => setViewMode(value as ViewMode)}
            >
              <ToggleGroupItem
                className={VIEW_ITEM_CLASS}
                value={VIEW_MODE.LIST}
                label={t('VIEW.LIST')}
              >
                <List size={16} />
              </ToggleGroupItem>
              <ToggleGroupItem
                className={VIEW_ITEM_CLASS}
                value={VIEW_MODE.BOARD}
                label={t('VIEW.BOARD')}
              >
                <Kanban size={16} />
              </ToggleGroupItem>
            </ToggleGroup>
            <IconButton
              variant="ghost"
              icon="settings"
              onClick={() => router.push(ROUTE.SETTINGS)}
            />
          </div>
        )}
      </header>
      <div className="min-h-0 flex-1">
        {/* Keyed by mode so switching adapters starts from a fresh load. */}
        <TasksList key={mode} mode={mode} view={view} />
      </div>
    </main>
  );
}
