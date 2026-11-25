'use client';

import { TasksKanbanFrame } from '../../components/tasks-kanban-frame.component';
import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.KANBAN.title);
  return (
    <div className="h-full -m-4">
      <TasksKanbanFrame />
    </div>
  );
}
