'use client';

import { useState } from 'react';
import { GoogleTasksComponent, IconButton } from '@vigilant-broccoli/react-lib';
import {
  authFetch,
  useAuthStatus,
  useGoogleToken,
  signInWithGoogle,
} from '../providers/auth-provider';
import { CreateTasksDialog } from './create-tasks-dialog';

const CREATE_TASKS_LABEL = 'Create tasks';

export const GoogleTasksView = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <GoogleTasksComponent
        auth={{ authFetch, useAuthStatus, useGoogleToken, signInWithGoogle }}
        showSelector
        enableDragDrop
        wrapInCard={false}
        refreshTrigger={refreshTrigger}
        addTaskActions={
          <IconButton
            icon="bot"
            variant="outline"
            onClick={() => setDialogOpen(true)}
            aria-label={CREATE_TASKS_LABEL}
          />
        }
      />
      {dialogOpen && (
        <CreateTasksDialog
          onClose={() => setDialogOpen(false)}
          onCreated={() => setRefreshTrigger(n => n + 1)}
        />
      )}
    </div>
  );
};
