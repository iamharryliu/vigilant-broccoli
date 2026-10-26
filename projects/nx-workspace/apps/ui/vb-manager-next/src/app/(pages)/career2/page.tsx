'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  FileExplorer,
  SORT_COLUMN,
  SORT_DIRECTION,
} from '@vigilant-broccoli/react-lib';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import { authFetch } from '../../../../libs/auth';
import { JobApplicationDialog } from '../../components/job-application-dialog.component';
import { SIDEBAR_ROUTE } from '../../app.const';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { usePageTitle } from '../../use-page-title';

const ROOT_LABEL = 'Job Applications';
const DEFAULT_SORT = {
  column: SORT_COLUMN.MODIFIED,
  direction: SORT_DIRECTION.DESC,
};

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.CAREER2.title);
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    // Cancels the layout's `main` p-4 so the explorer fills the content area edge to edge.
    <div className="-m-4 h-[calc(100%+2rem)]">
      <FileExplorer
        rootLabel={ROOT_LABEL}
        listEndpoint={API_ENDPOINTS.JOB_APPLICATIONS}
        fileEndpoint={API_ENDPOINTS.JOB_APPLICATIONS_FILE}
        fetcher={authFetch}
        onError={toast.error}
        defaultSort={DEFAULT_SORT}
        toolbarAction={
          <button
            type="button"
            aria-label="New job application"
            onClick={() => setDialogOpen(true)}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <Plus size={14} />
          </button>
        }
      />
      <JobApplicationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
