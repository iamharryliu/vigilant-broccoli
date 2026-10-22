'use client';

import { PreviewDeploymentsComponent } from '../../components/preview-deployments.component';
import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.PREVIEW_DEPLOYMENTS.title);
  return <PreviewDeploymentsComponent />;
}
