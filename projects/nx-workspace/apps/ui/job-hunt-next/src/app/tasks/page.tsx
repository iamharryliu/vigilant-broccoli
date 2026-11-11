'use client';

import { APP_TAB } from '../app.const';
import { PageContainer } from '../components/page-container.component';
import { TasksPage } from '../components/tasks-page.component';
import { useTranslation } from '../i18n';
import { useTabTitle } from '../use-page-title';

export default function Page() {
  useTabTitle(APP_TAB.TASKS);
  const { t } = useTranslation();
  return (
    <PageContainer title={t(APP_TAB.TASKS.titleKey)}>
      <TasksPage />
    </PageContainer>
  );
}
