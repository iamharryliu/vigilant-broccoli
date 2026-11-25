'use client';

import { type ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  CardContainer,
  Checkbox,
  GoogleSigninButton,
  IconButton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  downloadJson,
} from '@vigilant-broccoli/react-lib';
import {
  setDefaultTaskListId,
  useDefaultTaskListId,
} from '../../../libs/default-task-list';
import { signOut, tasksAuth, useAuthStatus } from '../../../libs/auth';
import {
  localTasksAuth,
  setLocalMode,
  signInFromLocalMode,
} from '../../../libs/local-mode';
import {
  STORAGE_MODE,
  type StorageMode,
  useStorageMode,
} from '../../../libs/storage-mode';
import { dbTasksAuth } from '../../../libs/db-tasks-auth';
import { KANBAN_STORE_BY_MODE } from '../../../libs/kanban-store';
import type { KanbanStore } from '@vigilant-broccoli/react-lib-tasks';
import { API_ENDPOINT, ROUTE } from '../app.const';
import {
  type AuthFetch,
  type TaskList,
  fetchJson,
  useTaskLists,
} from '../hooks/use-task-lists';
import { useTranslation } from '../i18n';
import { toTransferredKanban, type TransferredKanban } from './kanban-transfer';
import { StorageModeSelect } from './StorageModeSelect';
import { ImportTaskLists } from './ImportTaskLists';
import { TaskListsManager } from './TaskListsManager';

const EXPORT_FILENAME_PREFIX = 'tasks-export';

// Omitting the status filter returns active and completed tasks together.
const fetchTasks = async (authFetch: AuthFetch, taskListId: string) =>
  (
    await fetchJson<{ tasks: unknown[] }>(
      authFetch,
      `${API_ENDPOINT.TASKS}?${new URLSearchParams({ taskListId })}`,
    )
  ).tasks;

const exportTaskLists = async (
  authFetch: AuthFetch,
  taskLists: TaskList[],
  kanban: TransferredKanban | null,
) => {
  const exportedAt = new Date().toISOString();
  const lists = await Promise.all(
    taskLists.map(async list => ({
      ...list,
      tasks: await fetchTasks(authFetch, list.id),
    })),
  );
  downloadJson(
    { exportedAt, taskLists: lists, ...(kanban && { kanban }) },
    `${EXPORT_FILENAME_PREFIX}-${exportedAt.slice(0, 10)}`,
  );
};

function ExportTaskLists({
  authFetch,
  kanbanStore,
  taskLists,
  loadFailed,
}: {
  authFetch: AuthFetch;
  kanbanStore: KanbanStore;
  taskLists: TaskList[] | null;
  loadFailed: boolean;
}) {
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [exportFailed, setExportFailed] = useState(false);
  // Derived from the current lists so a deleted list drops out of the export.
  const selectedLists = (taskLists ?? []).filter(list =>
    selectedIds.has(list.id),
  );

  const toggle = (id: string, checked: boolean) =>
    setSelectedIds(previous => {
      const next = new Set(previous);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  const handleExport = async () => {
    setIsExporting(true);
    setExportFailed(false);
    try {
      // A failed load must not export as "no boards", so it fails the export.
      const loaded = await kanbanStore.load();
      if (!loaded.ok) throw new Error('Boards unavailable');
      const kanban = loaded.state
        ? toTransferredKanban(loaded.state, selectedLists)
        : null;
      await exportTaskLists(authFetch, selectedLists, kanban);
    } catch {
      setExportFailed(true);
    } finally {
      setIsExporting(false);
    }
  };

  const renderBody = () => {
    if (loadFailed) return <p>{t('SETTINGS.EXPORT.LOAD_FAILED')}</p>;
    if (!taskLists) return <p>{t('SETTINGS.EXPORT.LOADING')}</p>;
    if (taskLists.length === 0) return <p>{t('SETTINGS.EXPORT.EMPTY')}</p>;
    return (
      <>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={selectedLists.length === taskLists.length}
            onClick={() =>
              setSelectedIds(new Set(taskLists.map(list => list.id)))
            }
          >
            {t('SETTINGS.EXPORT.SELECT_ALL')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={selectedLists.length === 0}
            onClick={() => setSelectedIds(new Set())}
          >
            {t('SETTINGS.EXPORT.CLEAR_ALL')}
          </Button>
        </div>
        <ul className="flex flex-col gap-2">
          {taskLists.map(list => (
            <li key={list.id}>
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={selectedIds.has(list.id)}
                  onCheckedChange={checked => toggle(list.id, checked === true)}
                />
                {list.title}
              </label>
            </li>
          ))}
        </ul>
        <div>
          <Button
            disabled={selectedLists.length === 0 || isExporting}
            onClick={() => void handleExport()}
          >
            {isExporting
              ? t('SETTINGS.EXPORT.EXPORTING')
              : t('SETTINGS.EXPORT.SUBMIT')}
          </Button>
        </div>
        {exportFailed && (
          <p className="text-destructive">{t('SETTINGS.EXPORT.FAILED')}</p>
        )}
      </>
    );
  };

  return (
    <CardContainer title={t('SETTINGS.EXPORT.TITLE')}>
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {t('SETTINGS.EXPORT.DESCRIPTION')}
        </p>
        {renderBody()}
      </div>
    </CardContainer>
  );
}

const SETTINGS_TAB = {
  TASKS: 'tasks',
  DATA: 'data',
  ACCOUNT: 'account',
} as const;

function SettingsTabs({
  authFetch,
  mode,
  account,
}: {
  authFetch: AuthFetch;
  mode: StorageMode;
  account: ReactNode;
}) {
  const { t } = useTranslation();
  const taskListsState = useTaskLists(authFetch);
  const defaultTaskListId = useDefaultTaskListId(mode);
  return (
    <Tabs defaultValue={SETTINGS_TAB.TASKS}>
      <TabsList>
        <TabsTrigger value={SETTINGS_TAB.TASKS}>
          {t('SETTINGS.TABS.TASKS')}
        </TabsTrigger>
        <TabsTrigger value={SETTINGS_TAB.DATA}>
          {t('SETTINGS.TABS.DATA')}
        </TabsTrigger>
        <TabsTrigger value={SETTINGS_TAB.ACCOUNT}>
          {t('SETTINGS.TABS.ACCOUNT')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value={SETTINGS_TAB.TASKS}>
        <TaskListsManager
          {...taskListsState}
          defaultTaskListId={defaultTaskListId}
          canDeleteFirstList={mode !== STORAGE_MODE.GOOGLE}
          setDefaultTaskList={taskListId =>
            setDefaultTaskListId(mode, taskListId)
          }
        />
      </TabsContent>
      <TabsContent value={SETTINGS_TAB.DATA} className="flex flex-col gap-4">
        <ExportTaskLists
          authFetch={authFetch}
          kanbanStore={KANBAN_STORE_BY_MODE[mode]}
          taskLists={taskListsState.taskLists}
          loadFailed={taskListsState.loadFailed}
        />
        <ImportTaskLists
          authFetch={authFetch}
          kanbanStore={KANBAN_STORE_BY_MODE[mode]}
          taskLists={taskListsState.taskLists}
          loadFailed={taskListsState.loadFailed}
          createTaskList={taskListsState.createTaskList}
          refreshTaskLists={taskListsState.refreshTaskLists}
          supportsBulkImport={mode !== STORAGE_MODE.GOOGLE}
        />
      </TabsContent>
      <TabsContent value={SETTINGS_TAB.ACCOUNT} className="flex flex-col gap-4">
        {account}
      </TabsContent>
    </Tabs>
  );
}

export function SettingsView() {
  const { t } = useTranslation();
  const router = useRouter();
  const authStatus = useAuthStatus();
  const mode = useStorageMode();
  const isSignedIn = authStatus === 'authenticated';

  const handleSignOut = async () => {
    await signOut();
    router.replace(ROUTE.HOME);
  };

  const renderContent = () => {
    if (mode === STORAGE_MODE.LOCAL) {
      return (
        <SettingsTabs
          // Keyed by mode so each adapter loads its own lists.
          key="local"
          authFetch={localTasksAuth.authFetch}
          mode={mode}
          account={
            <>
              <CardContainer title={t('SETTINGS.ACCOUNT.TITLE')}>
                <div className="flex flex-col items-start gap-3">
                  <p className="text-sm text-muted-foreground">
                    {isSignedIn
                      ? t('SETTINGS.ACCOUNT.LOCAL_MODE_SIGNED_IN')
                      : t('SETTINGS.ACCOUNT.LOCAL_MODE')}
                  </p>
                  {/* The Google session survives local mode, so a signed-in user
                    switches straight back instead of signing in again. */}
                  {isSignedIn ? (
                    <Button
                      variant="outline"
                      onClick={() => setLocalMode(false)}
                    >
                      {t('LOCAL_MODE.LEAVE')}
                    </Button>
                  ) : (
                    <GoogleSigninButton
                      onClick={() => void signInFromLocalMode()}
                    />
                  )}
                </div>
              </CardContainer>
            </>
          }
        />
      );
    }
    if (isSignedIn) {
      return (
        <SettingsTabs
          key={mode}
          authFetch={
            mode === STORAGE_MODE.DATABASE
              ? dbTasksAuth.authFetch
              : tasksAuth.authFetch
          }
          mode={mode}
          account={
            <>
              <CardContainer title={t('SETTINGS.ACCOUNT.TITLE')}>
                <Button variant="outline" onClick={() => void handleSignOut()}>
                  {t('AUTH.SIGN_OUT')}
                </Button>
              </CardContainer>
            </>
          }
        />
      );
    }
    if (authStatus === 'unauthenticated') {
      return (
        <div className="flex flex-col items-start gap-2">
          <p>{t('SETTINGS.SIGNED_OUT')}</p>
          <Button onClick={() => router.push(ROUTE.LOGIN)}>
            {t('AUTH.SIGN_IN')}
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-4 p-4">
      <header className="flex items-center gap-2">
        <IconButton
          variant="ghost"
          icon="arrow-left"
          onClick={() => router.push(ROUTE.HOME)}
        />
        <h1 className="text-xl font-semibold">{t('SETTINGS.TITLE')}</h1>
        {(isSignedIn || mode === STORAGE_MODE.LOCAL) && (
          <div className="ml-auto">
            <StorageModeSelect />
          </div>
        )}
      </header>
      {renderContent()}
    </main>
  );
}
