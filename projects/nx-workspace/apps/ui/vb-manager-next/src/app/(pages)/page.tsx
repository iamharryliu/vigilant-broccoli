'use client';

import { TaskListSelectorComponent } from '../components/task-list-selector.component';
import { DashboardInfoCard } from '../components/dashboard-info-card.component';
import { PersonalCalendarComponent } from '../components/personal-calendar.component';
import { SIDEBAR_ROUTE } from '../app.const';
import { usePageTitle } from '../use-page-title';

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.INDEX.title);

  return (
    <div className="grid grid-cols-2 gap-4 h-full overflow-hidden">
      <div className="flex flex-col h-full gap-4 min-h-0">
        <DashboardInfoCard />
        <div className="flex-1 min-h-0">
          <TaskListSelectorComponent />
        </div>
      </div>
      <div className="flex flex-col h-full">
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden h-full">
          <PersonalCalendarComponent mode="AGENDA" className="h-full" />
        </div>
      </div>
    </div>
  );
}
