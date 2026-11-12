'use client';

import { useState } from 'react';
import { CircleHelp } from 'lucide-react';
import { Button } from '@vigilant-broccoli/react-lib';
import { APP_TAB } from '../app.const';
import { JobMatchesHelpDialog } from '../components/job-matches-help-dialog.component';
import { JobMatchesPage } from '../components/job-matches-page.component';
import { PageContainer } from '../components/page-container.component';
import { useTranslation } from '../i18n';
import { useTabTitle } from '../use-page-title';

export default function Page() {
  useTabTitle(APP_TAB.MATCHES);
  const { t } = useTranslation();
  const [helpOpen, setHelpOpen] = useState(false);
  return (
    <PageContainer
      title={t(APP_TAB.MATCHES.titleKey)}
      actions={
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('MATCHES.HELP_LABEL')}
          onClick={() => setHelpOpen(true)}
        >
          <CircleHelp />
        </Button>
      }
    >
      <JobMatchesPage />
      <JobMatchesHelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </PageContainer>
  );
}
