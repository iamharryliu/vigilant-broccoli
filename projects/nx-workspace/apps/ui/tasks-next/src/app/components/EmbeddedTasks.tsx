'use client';

import { useEffect } from 'react';
import { GoogleTasksComponent } from '@vigilant-broccoli/react-lib-tasks';
import { embedTasksAuth, setSession } from '../../../libs/auth';
import { parentSessionTasksAuth } from '../../../libs/parent-session';
import { listenForPopupSession } from '../../../libs/sign-in-popup';

export function EmbeddedTasks({ parentSession }: { parentSession: boolean }) {
  useEffect(() => {
    if (parentSession) return;
    return listenForPopupSession(tokens => void setSession(tokens));
  }, [parentSession]);

  return (
    <main className="h-dvh">
      {/* Embedders draw the frame: a border here would use this page's theme, not theirs. */}
      <GoogleTasksComponent
        auth={parentSession ? parentSessionTasksAuth : embedTasksAuth}
        wrapInCard={false}
        enableDragDrop
        enableVoiceInput={false}
      />
    </main>
  );
}
