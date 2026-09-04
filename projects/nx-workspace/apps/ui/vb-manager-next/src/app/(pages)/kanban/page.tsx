'use client';

import { KanbanComponent } from '../../components/kanban.component';
import { APP_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(APP_ROUTE.KANBAN.title);
  return (
    <div className="h-full -m-4">
      <KanbanComponent />
    </div>
  );
}
