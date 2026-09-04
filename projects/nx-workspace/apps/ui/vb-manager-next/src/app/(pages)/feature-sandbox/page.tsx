'use client';

import { FeatureSandboxPage } from '../../components/pages/FeatureSandboxPage';
import { APP_ROUTE } from '../../app.const';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  usePageTitle(APP_ROUTE.FEATURE_SANDBOX.title);
  return <FeatureSandboxPage />;
}
