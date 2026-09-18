'use client';

import { FeatureSandboxPage } from '../../components/pages/FeatureSandboxPage';
import { SIDEBAR_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.FEATURE_SANDBOX.title);
  return <FeatureSandboxPage />;
}
