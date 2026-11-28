'use client';

import { useState } from 'react';
import { CircleHelp } from 'lucide-react';
import { Button } from '@vigilant-broccoli/react-lib';
import { APP_TAB } from '../app.const';
import { JobPostingsHelpDialog } from '../components/job-postings-help-dialog.component';
import { JobPostingsPage } from '../components/job-postings-page.component';
import { PageContainer } from '../components/page-container.component';
import { useTranslation } from '../i18n';
import { useTabTitle } from '../use-page-title';

export default function Page() {
  useTabTitle(APP_TAB.JOB_POSTINGS);
  const { t } = useTranslation();
  const [helpOpen, setHelpOpen] = useState(false);
  return (
    <PageContainer
      title={t(APP_TAB.JOB_POSTINGS.titleKey)}
      actions={
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('JOB_POSTINGS.HELP_LABEL')}
          onClick={() => setHelpOpen(true)}
        >
          <CircleHelp />
        </Button>
      }
    >
      <JobPostingsPage />
      <JobPostingsHelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </PageContainer>
  );
}
