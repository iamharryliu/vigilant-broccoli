'use client';

import { FileExplorer } from '../../components/file-explorer.component';
import { SIDEBAR_ROUTE } from '../../app.const';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { usePageTitle } from '../../use-page-title';

const ROOT_LABEL = 'Job Applications';

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.CAREER2.title);
  return (
    // Cancels the layout's `main` p-4 so the explorer fills the content area edge to edge.
    <div className="-m-4 h-[calc(100%+2rem)]">
      <FileExplorer
        rootLabel={ROOT_LABEL}
        listEndpoint={API_ENDPOINTS.JOB_APPLICATIONS}
        fileEndpoint={API_ENDPOINTS.JOB_APPLICATIONS_FILE}
      />
    </div>
  );
}
