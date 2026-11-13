'use client';

import { Button } from '@vigilant-broccoli/react-lib';
import { GoogleTasksComponent } from '@vigilant-broccoli/react-lib-higher-level';
import { signOut, tasksAuth, useAuthStatus } from '../../../libs/auth';
import { useTranslation } from '../i18n';

export function TasksApp() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStatus() === 'authenticated';

  return (
    <main className="mx-auto flex h-dvh max-w-2xl flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('APP.NAME')}</h1>
        {isAuthenticated && (
          <Button variant="ghost" onClick={() => void signOut()}>
            {t('AUTH.SIGN_OUT')}
          </Button>
        )}
      </header>
      <div className="min-h-0 flex-1">
        <GoogleTasksComponent
          auth={tasksAuth}
          enableDragDrop
          enableVoiceInput={false}
        />
      </div>
    </main>
  );
}
