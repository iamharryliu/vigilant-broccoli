'use client';

import { useState } from 'react';
import { GoogleTasksComponent } from '@vigilant-broccoli/react-lib';
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
      <button
        onClick={() => setDialogOpen(true)}
        className="w-full bg-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-600 active:bg-blue-700 transition-colors"
      >
        {CREATE_TASKS_LABEL}
      </button>
      <GoogleTasksComponent
        auth={{ authFetch, useAuthStatus, useGoogleToken, signInWithGoogle }}
        showSelector
        enableDragDrop
        wrapInCard={false}
        refreshTrigger={refreshTrigger}
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
