'use client';

import { TaskListSelectorComponent } from '../components/task-list-selector.component';
import { WeatherClockCard } from '../components/weather-clock-card.component';
import { HomeCalendarTabs } from '../components/home-calendar-tabs.component';
import { SIDEBAR_ROUTE } from '../app.const';
import { usePageTitle } from '../use-page-title';

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.INDEX.title);

  return (
    <div className="grid grid-cols-2 gap-4 h-full overflow-hidden">
      <div className="flex flex-col h-full gap-4 min-h-0">
        <WeatherClockCard />
        <div className="flex-1 min-h-0">
          <TaskListSelectorComponent />
        </div>
      </div>
      <div className="h-full min-h-0 min-w-0">
        <HomeCalendarTabs />
      </div>
    </div>
  );
}
