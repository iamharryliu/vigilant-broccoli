'use client';

import { useEffect } from 'react';
import {
  GoogleTasksComponent,
  KanbanBoards,
} from '@vigilant-broccoli/react-lib-tasks';
import { embedTasksAuth, setSession } from '../../../libs/auth';
import {
  GOOGLE_KANBAN_STORE,
  PARENT_SESSION_GOOGLE_KANBAN_STORE,
} from '../../../libs/kanban-store';
import { parentSessionTasksAuth } from '../../../libs/parent-session';
import { listenForPopupSession } from '../../../libs/sign-in-popup';

export function EmbeddedKanban({ parentSession }: { parentSession: boolean }) {
  const auth = parentSession ? parentSessionTasksAuth : embedTasksAuth;
  const isSignedIn = auth.useAuthStatus() === 'authenticated';

  useEffect(() => {
    if (parentSession) return;
    return listenForPopupSession(tokens => void setSession(tokens));
  }, [parentSession]);

  return (
    <main className="h-dvh">
      {isSignedIn ? (
        <KanbanBoards
          auth={auth}
          store={
            parentSession
              ? PARENT_SESSION_GOOGLE_KANBAN_STORE
              : GOOGLE_KANBAN_STORE
          }
        />
      ) : (
        // The list's sign-in prompt; the board needs a signed-in store.
        <GoogleTasksComponent
          auth={auth}
          wrapInCard={false}
          enableVoiceInput={false}
        />
      )}
    </main>
  );
}
