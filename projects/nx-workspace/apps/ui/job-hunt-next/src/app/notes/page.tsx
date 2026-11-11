'use client';

import { APP_TAB } from '../app.const';
import { NotesPage } from '../components/notes-page.component';
import { PageContainer } from '../components/page-container.component';
import { useTranslation } from '../i18n';
import { useTabTitle } from '../use-page-title';

export default function Page() {
  useTabTitle(APP_TAB.NOTES);
  const { t } = useTranslation();
  return (
    <PageContainer title={t(APP_TAB.NOTES.titleKey)}>
      <NotesPage />
    </PageContainer>
  );
}
