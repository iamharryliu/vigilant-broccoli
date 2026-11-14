'use client';

import { useEffect } from 'react';
import { GoogleTasksComponent } from '@vigilant-broccoli/react-lib-higher-level';
import { embedTasksAuth, setSession } from '../../../libs/auth';
import { listenForPopupSession } from '../../../libs/sign-in-popup';

export function EmbeddedTasks() {
  useEffect(() => listenForPopupSession(tokens => void setSession(tokens)), []);

  return (
    <main className="h-dvh">
      {/* Embedders draw the frame: a border here would use this page's theme, not theirs. */}
      <GoogleTasksComponent
        auth={embedTasksAuth}
        wrapInCard={false}
        enableDragDrop
        enableVoiceInput={false}
      />
    </main>
  );
}
