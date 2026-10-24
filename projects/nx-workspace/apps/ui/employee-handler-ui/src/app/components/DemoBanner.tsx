'use client';

import { FlaskConical } from 'lucide-react';
import { useTranslation } from '../i18n';

export default function DemoBanner() {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      className="sticky top-0 z-20 flex items-center gap-2 border-b border-amber-300 bg-amber-100 px-4 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
    >
      <FlaskConical className="h-4 w-4 shrink-0" aria-hidden />
      <span className="font-semibold">{t('DEMO.LABEL')}</span>
      <span>{t('DEMO.MESSAGE')}</span>
    </div>
  );
}
