'use client';

import { APP_TAB } from '../app.const';
import { PageContainer } from '../components/page-container.component';
import { SettingsPage } from '../components/settings-page.component';
import { useTranslation } from '../i18n';
import { useTabTitle } from '../use-page-title';

export default function Page() {
  useTabTitle(APP_TAB.SETTINGS);
  const { t } = useTranslation();
  return (
    <PageContainer title={t(APP_TAB.SETTINGS.titleKey)}>
      <SettingsPage />
    </PageContainer>
  );
}
