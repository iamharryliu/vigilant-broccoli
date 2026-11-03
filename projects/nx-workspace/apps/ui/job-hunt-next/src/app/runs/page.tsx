'use client';

import { APP_TAB } from '../app.const';
import { PageContainer } from '../components/page-container.component';
import { RunList } from '../components/run-list.component';
import { useTranslation } from '../i18n';
import { useTabTitle } from '../use-page-title';

export default function Page() {
  useTabTitle(APP_TAB.RUNS);
  const { t } = useTranslation();
  return (
    <PageContainer title={t(APP_TAB.RUNS.titleKey)}>
      <RunList />
    </PageContainer>
  );
}
