'use client';

import { JobApplicationList } from '../../components/job-application-list.component';
import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.SAMPLE.title);
  return <JobApplicationList />;
}
