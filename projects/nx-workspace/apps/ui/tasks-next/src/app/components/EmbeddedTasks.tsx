'use client';

import { useEffect } from 'react';
import { GoogleTasksComponent } from '@vigilant-broccoli/react-lib-higher-level';
import { embedTasksAuth, setSession } from '../../../libs/auth';
import { listenForPopupSession } from '../../../libs/sign-in-popup';

export function EmbeddedTasks() {
  useEffect(() => listenForPopupSession(tokens => void setSession(tokens)), []);

  return (
    <main className="h-dvh p-2">
      <GoogleTasksComponent
        auth={embedTasksAuth}
        enableDragDrop
        enableVoiceInput={false}
      />
    </main>
  );
}
