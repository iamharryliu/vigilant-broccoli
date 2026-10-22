'use client';

import { PREVIEW_DEPLOYMENTS_API_PATH } from '@vigilant-broccoli/github-workspace-js';
import { PreviewDeployments } from '@vigilant-broccoli/react-lib-higher-level';
import { authFetch } from '../../../../libs/auth';
import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

const loadPreviewDeployments = async () =>
  (await authFetch(PREVIEW_DEPLOYMENTS_API_PATH)).json();

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.PREVIEW_DEPLOYMENTS.title);
  return <PreviewDeployments loadPreviewDeployments={loadPreviewDeployments} />;
}
