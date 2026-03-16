'use client';

import { KanbanComponent } from '../../components/kanban.component';

export default function Page() {
  return (
    <div className="fixed inset-0 top-[var(--space-9)] -m-4">
      <KanbanComponent />
    </div>
  );
}
