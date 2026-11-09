'use client';

import { TaskList } from '../components/TaskList';

export function TasksPageContent() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <TaskList />
    </div>
  );
}
