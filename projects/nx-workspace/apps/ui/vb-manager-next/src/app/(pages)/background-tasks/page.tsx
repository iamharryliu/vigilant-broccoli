'use client';

import { BackgroundTasksComponent } from '../../components/background-tasks.component';
import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.BACKGROUND_TASKS.title);
  return <BackgroundTasksComponent />;
}
