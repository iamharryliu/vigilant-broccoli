'use client';

import { RunList } from '../components/run-list.component';
import { APP_ROUTE } from '../app.const';
import { useTranslation } from '../i18n';
import { usePageTitle } from '../use-page-title';

export default function Page() {
  const { t } = useTranslation();
  usePageTitle(t(APP_ROUTE.RUNS.titleKey));
  return <RunList />;
}
