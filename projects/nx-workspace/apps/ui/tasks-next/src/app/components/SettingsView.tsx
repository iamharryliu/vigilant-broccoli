'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  CardContainer,
  Checkbox,
  GoogleSigninButton,
  IconButton,
  downloadJson,
} from '@vigilant-broccoli/react-lib';
import { signOut, tasksAuth, useAuthStatus } from '../../../libs/auth';
import {
  localTasksAuth,
  setLocalMode,
  signInFromLocalMode,
  useLocalMode,
} from '../../../libs/local-mode';
import { API_ENDPOINT, ROUTE } from '../app.const';
import {
  type AuthFetch,
  type TaskList,
  fetchJson,
  useTaskLists,
} from '../hooks/use-task-lists';
import { useTranslation } from '../i18n';
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

const exportTaskLists = async (authFetch: AuthFetch, taskLists: TaskList[]) => {
  const exportedAt = new Date().toISOString();
  const lists = await Promise.all(
    taskLists.map(async list => ({
      ...list,
      tasks: await fetchTasks(authFetch, list.id),
    })),
  );
  downloadJson(
    { exportedAt, taskLists: lists },
    `${EXPORT_FILENAME_PREFIX}-${exportedAt.slice(0, 10)}`,
  );
};

function ExportTaskLists({
  authFetch,
  taskLists,
  loadFailed,
}: {
  authFetch: AuthFetch;
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
      await exportTaskLists(authFetch, selectedLists);
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

function TaskListSettings({ authFetch }: { authFetch: AuthFetch }) {
  const taskListsState = useTaskLists(authFetch);
  return (
    <>
      <TaskListsManager {...taskListsState} />
      <ExportTaskLists
        authFetch={authFetch}
        taskLists={taskListsState.taskLists}
        loadFailed={taskListsState.loadFailed}
      />
    </>
  );
}

export function SettingsView() {
  const { t } = useTranslation();
  const router = useRouter();
  const authStatus = useAuthStatus();
  const isLocalMode = useLocalMode();
  const isSignedIn = authStatus === 'authenticated';

  const handleSignOut = async () => {
    await signOut();
    router.replace(ROUTE.HOME);
  };

  const renderContent = () => {
    if (isLocalMode) {
      return (
        <>
          {/* Keyed by mode so each adapter loads its own lists. */}
          <TaskListSettings key="local" authFetch={localTasksAuth.authFetch} />
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
                <Button variant="outline" onClick={() => setLocalMode(false)}>
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
      );
    }
    if (isSignedIn) {
      return (
        <>
          <TaskListSettings key="google" authFetch={tasksAuth.authFetch} />
          <CardContainer title={t('SETTINGS.ACCOUNT.TITLE')}>
            <Button variant="outline" onClick={() => void handleSignOut()}>
              {t('AUTH.SIGN_OUT')}
            </Button>
          </CardContainer>
        </>
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
      </header>
      {renderContent()}
    </main>
  );
}
