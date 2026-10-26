'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CareerExperienceEditor,
  ResumeEditor,
} from './components/career-editor.component';
import { JobApplicationList } from './components/job-application-list.component';
import { RunList } from './components/run-list.component';
import { APP_TAB, TAB_PARAM, toTab } from './app.const';
import { useTranslation } from './i18n';
import { usePageTitle } from './use-page-title';

const TAB_CONTENT = {
  [APP_TAB.APPLICATIONS.value]: JobApplicationList,
  [APP_TAB.CAREER_EXPERIENCE.value]: CareerExperienceEditor,
  [APP_TAB.RESUME.value]: ResumeEditor,
  [APP_TAB.RUNS.value]: RunList,
};

// The active tab lives in the URL so the sidebar and run toasts can link to it.
const ActiveTab = () => {
  const { t } = useTranslation();
  const tab = toTab(useSearchParams().get(TAB_PARAM));
  usePageTitle(t(tab.titleKey));
  const Content = TAB_CONTENT[tab.value];
  return <Content />;
};

export default function Page() {
  return (
    <Suspense>
      <ActiveTab />
    </Suspense>
  );
}
