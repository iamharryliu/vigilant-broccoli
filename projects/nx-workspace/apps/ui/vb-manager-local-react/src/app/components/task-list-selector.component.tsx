import { useState } from 'react';
import { GoogleTasksComponent } from '@vigilant-broccoli/react-lib';
import { googleTasksAuth } from '../../libs/auth';
import { CreateTasksDialogTrigger } from './create-tasks-dialog.component';

export const TaskListSelectorComponent = ({
  taskListId,
}: { taskListId?: string } = {}) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <GoogleTasksComponent
      auth={googleTasksAuth}
      taskListId={taskListId}
      showSelector={!taskListId}
      refreshTrigger={refreshTrigger}
      addTaskActions={
        <CreateTasksDialogTrigger
          taskListId={taskListId}
          onCreated={() => setRefreshTrigger(prev => prev + 1)}
        />
      }
    />
  );
};
