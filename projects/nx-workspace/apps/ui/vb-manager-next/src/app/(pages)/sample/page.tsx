'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@vigilant-broccoli/react-lib';
import { JobApplicationDialog } from '../../components/job-application-dialog.component';
import { JobApplicationList } from '../../components/job-application-list.component';
import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.SAMPLE.title);
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus size={14} /> New job application
        </Button>
      </div>
      <JobApplicationList />
      <JobApplicationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
