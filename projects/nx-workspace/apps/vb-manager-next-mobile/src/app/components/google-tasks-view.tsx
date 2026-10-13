'use client';

import { useState } from 'react';
import {
  GoogleTasksComponent,
  IconButton,
  CreateTasksDialog,
} from '@vigilant-broccoli/react-lib';
import { googleTasksAuth } from '../providers/auth-provider';
import { TaskVoiceButton } from './task-voice-button';

const CREATE_TASKS_LABEL = 'Create tasks';

export const GoogleTasksView = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <GoogleTasksComponent
      auth={googleTasksAuth}
      showSelector
      enableDragDrop
      wrapInCard={false}
      refreshTrigger={refreshTrigger}
      addTaskActions={
        <CreateTasksDialog
          trigger={
            <IconButton
              icon="bot"
              variant="outline"
              aria-label={CREATE_TASKS_LABEL}
            />
          }
          auth={googleTasksAuth}
          onCreated={() => setRefreshTrigger(n => n + 1)}
          renderVoiceAction={onTranscript => (
            <TaskVoiceButton onTranscript={onTranscript} />
          )}
        />
      }
    />
  );
};
