'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@vigilant-broccoli/react-lib';
import { JobApplicationDialog } from './components/job-application-dialog.component';
import { JobApplicationList } from './components/job-application-list.component';
import { APP_ROUTE } from './app.const';
import { useTranslation } from './i18n';
import { usePageTitle } from './use-page-title';

export default function Page() {
  const { t } = useTranslation();
  usePageTitle(t(APP_ROUTE.APPLICATIONS.titleKey));
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus size={14} /> {t('APPLICATIONS.NEW')}
        </Button>
      </div>
      <JobApplicationList />
      <JobApplicationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
