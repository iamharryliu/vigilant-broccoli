'use client';

import { CircleHelp } from 'lucide-react';
import { Button } from '@vigilant-broccoli/react-lib';
import { APP_TAB } from './app.const';
import { JobApplicationList } from './components/job-application-list.component';
import { PageContainer } from './components/page-container.component';
import { OPEN_HELP_EVENT } from './constants/career';
import { useTranslation } from './i18n';
import { useTabTitle } from './use-page-title';

export default function Page() {
  useTabTitle(APP_TAB.APPLICATIONS);
  const { t } = useTranslation();
  return (
    <PageContainer
      title={t(APP_TAB.APPLICATIONS.titleKey)}
      actions={
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('HELP.LABEL')}
          onClick={() => window.dispatchEvent(new Event(OPEN_HELP_EVENT))}
        >
          <CircleHelp />
        </Button>
      }
    >
      <JobApplicationList />
    </PageContainer>
  );
}
