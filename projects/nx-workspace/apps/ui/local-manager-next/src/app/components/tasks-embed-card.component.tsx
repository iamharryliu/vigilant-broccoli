'use client';

import { TaskListSelectorComponent } from './task-list-selector.component';

// NEXT_PUBLIC_* must be read directly here for build-time inlining. Unset keeps
// the native task list while tasks-next is not deployed.
const TASKS_URL = process.env.NEXT_PUBLIC_TASKS_URL;
const TASKS_EMBED_PATH = '/embed';
const TASKS_FRAME_TITLE = 'Tasks';

export const TasksCard = () =>
  TASKS_URL ? (
    <iframe
      src={`${TASKS_URL}${TASKS_EMBED_PATH}`}
      title={TASKS_FRAME_TITLE}
      className="h-full w-full rounded-lg border-0"
    />
  ) : (
    <TaskListSelectorComponent />
  );
