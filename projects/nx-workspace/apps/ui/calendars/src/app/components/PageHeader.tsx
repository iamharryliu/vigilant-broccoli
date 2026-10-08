'use client';

import { useTranslation } from '../i18n';

export const PageHeader = () => {
  const { t } = useTranslation();

  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {t('TITLE')}
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {t('SUBTITLE')}
      </p>
    </header>
  );
};
