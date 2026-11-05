'use client';

import { VB_MONITORING_URL } from '@vigilant-broccoli/infrastructure';
import { useTranslation } from '../../i18n';
import { usePageTitle } from '../../use-page-title';

export default function Page() {
  const { t } = useTranslation();
  const title = t('STATUS.TITLE');
  usePageTitle(title);

  return (
    <iframe
      src={VB_MONITORING_URL.STATUS.URL}
      title={title}
      className="block min-h-0 min-w-0 h-full w-full flex-1 border-0"
    />
  );
}
