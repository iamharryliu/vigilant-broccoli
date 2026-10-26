'use client';

import { CareerEditor } from '../components/career-editor.component';
import { APP_ROUTE } from '../app.const';
import { useTranslation } from '../i18n';
import { usePageTitle } from '../use-page-title';

export default function Page() {
  const { t } = useTranslation();
  usePageTitle(t(APP_ROUTE.CAREER.titleKey));
  return <CareerEditor />;
}
