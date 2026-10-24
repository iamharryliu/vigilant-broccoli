'use client';

import { useEffect, useRef, useState } from 'react';
import { IconButton } from '@vigilant-broccoli/react-lib';
import {
  GoogleTasksComponent,
  CreateTasksDialog,
} from '@vigilant-broccoli/react-lib-higher-level';
import { googleTasksAuth } from '../providers/auth-provider';
import { TaskVoiceButton } from './task-voice-button';

const CREATE_TASKS_LABEL = 'Create tasks';

interface GoogleTasksViewProps {
  active: boolean;
}

export const GoogleTasksView = ({ active }: GoogleTasksViewProps) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const wasActive = useRef(active);

  // The tab stays mounted so tasks load with the page; refetch each time it
  // is reopened. The mount itself already fetches, so only re-activation counts.
  useEffect(() => {
    if (active && !wasActive.current) setRefreshTrigger(n => n + 1);
    wasActive.current = active;
  }, [active]);

  return (
    <GoogleTasksComponent
      auth={googleTasksAuth}
      showSelector
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
