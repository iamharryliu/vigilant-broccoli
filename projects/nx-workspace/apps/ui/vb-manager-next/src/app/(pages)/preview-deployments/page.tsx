'use client';

import { PreviewDeployments } from '@vigilant-broccoli/react-lib-higher-level';
import { authFetch } from '../../../../libs/auth';
import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.PREVIEW_DEPLOYMENTS.title);
  return <PreviewDeployments authFetch={authFetch} />;
}
