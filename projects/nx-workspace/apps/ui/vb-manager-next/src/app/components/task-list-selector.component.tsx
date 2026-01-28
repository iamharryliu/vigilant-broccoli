'use client';

import { GoogleTasksComponent } from './google-tasks.component';

export const TaskListSelectorComponent = ({ taskListId }: { taskListId?: string } = {}) => {
  return <GoogleTasksComponent taskListId={taskListId} showSelector={!taskListId} />;
};
