'use client';

import { GoogleTasksComponent } from '@vigilant-broccoli/react-lib';
import {
  authFetch,
  useAuthStatus,
  useGoogleToken,
  signInWithGoogle,
} from '../../../libs/auth';

export const TaskListSelectorComponent = ({
  taskListId,
}: { taskListId?: string } = {}) => {
  return (
    <GoogleTasksComponent
      auth={{ authFetch, useAuthStatus, useGoogleToken, signInWithGoogle }}
      taskListId={taskListId}
      showSelector={!taskListId}
    />
  );
};
