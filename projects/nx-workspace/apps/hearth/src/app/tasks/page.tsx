'use client';

import { TasksPageContent } from './TasksPageContent';
import { PAGE_TITLES, usePageTitle } from '../../lib/page-title';

export default function TasksPage() {
  usePageTitle(PAGE_TITLES.TASKS);
  return <TasksPageContent />;
}
