'use client';

import { APP_TAB } from '../../app.const';
import { PageContainer } from '../../components/page-container.component';
import { SkillsGlossaryPage } from '../../components/skills-glossary-page.component';
import { useTranslation } from '../../i18n';
import { useTabTitle } from '../../use-page-title';

export default function Page() {
  useTabTitle(APP_TAB.SKILLS_GLOSSARY);
  const { t } = useTranslation();
  return (
    <PageContainer title={t(APP_TAB.SKILLS_GLOSSARY.titleKey)}>
      <SkillsGlossaryPage />
    </PageContainer>
  );
}
