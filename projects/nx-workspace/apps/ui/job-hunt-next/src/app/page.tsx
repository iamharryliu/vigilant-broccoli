'use client';

import { APP_TAB } from './app.const';
import { JobApplicationList } from './components/job-application-list.component';
import { useTabTitle } from './use-page-title';

export default function Page() {
  useTabTitle(APP_TAB.APPLICATIONS);
  return <JobApplicationList />;
}
