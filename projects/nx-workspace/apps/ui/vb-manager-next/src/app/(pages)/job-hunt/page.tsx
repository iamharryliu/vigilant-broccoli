'use client';

import { LOCAL_HOST_URL } from '@vigilant-broccoli/private-infrastructure';
import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

// job-applications-next runs as its own container behind the local k3s
// ingress; the frame needs clipboard access for its Copy buttons.
export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.JOB_HUNT.title);
  return (
    <iframe
      src={LOCAL_HOST_URL.JOB_HUNT.URL}
      title={SIDEBAR_ROUTE.JOB_HUNT.title}
      allow="clipboard-write"
      className="h-full w-full rounded border border-border"
    />
  );
}
