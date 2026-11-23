'use client';

import { APP_TAB } from '../app.const';
import { PageContainer } from '../components/page-container.component';
import { SkillsPage } from '../components/skills-page.component';
import { useTranslation } from '../i18n';
import { useTabTitle } from '../use-page-title';

export default function Page() {
  useTabTitle(APP_TAB.SKILLS);
  const { t } = useTranslation();
  return (
    <PageContainer title={t(APP_TAB.SKILLS.titleKey)}>
      <SkillsPage />
    </PageContainer>
  );
}
