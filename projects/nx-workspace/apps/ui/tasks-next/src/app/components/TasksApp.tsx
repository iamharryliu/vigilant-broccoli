'use client';

import { useRouter } from 'next/navigation';
import { IconButton } from '@vigilant-broccoli/react-lib';
import { GoogleTasksComponent } from '@vigilant-broccoli/react-lib-tasks';
import { tasksAuth, useAuthStatus } from '../../../libs/auth';
import {
  localTasksAuth,
  setLocalMode,
  useLocalMode,
} from '../../../libs/local-mode';
import { ROUTE } from '../app.const';
import { useTranslation } from '../i18n';

export function TasksApp() {
  const { t } = useTranslation();
  const router = useRouter();
  const isLocalMode = useLocalMode();
  const isAuthenticated = useAuthStatus() === 'authenticated';

  return (
    <main className="mx-auto flex h-dvh max-w-2xl flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('APP.NAME')}</h1>
        {(isAuthenticated || isLocalMode) && (
          <div className="flex items-center gap-1">
            <IconButton
              variant={isLocalMode ? 'secondary' : 'ghost'}
              icon="incognito"
              aria-pressed={isLocalMode}
              title={
                isLocalMode ? t('LOCAL_MODE.LEAVE') : t('LOCAL_MODE.ENTER')
              }
              onClick={() => setLocalMode(!isLocalMode)}
            />
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
        <GoogleTasksComponent
          key={isLocalMode ? 'local' : 'google'}
          auth={isLocalMode ? localTasksAuth : tasksAuth}
          enableDragDrop
          enableVoiceInput={false}
          onUseLocally={() => setLocalMode(true)}
        />
      </div>
    </main>
  );
}
