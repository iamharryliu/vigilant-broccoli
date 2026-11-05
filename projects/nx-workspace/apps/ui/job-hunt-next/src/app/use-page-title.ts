'use client';

import { useDocumentTitle } from '@vigilant-broccoli/react-lib';
import { APP_TAB } from './app.const';
import { useTranslation } from './i18n';

export const usePageTitle = (title: string) => {
  const { t } = useTranslation();
  useDocumentTitle(`${title} | ${t('APP.LABEL')}`);
};

export const useTabTitle = (tab: (typeof APP_TAB)[keyof typeof APP_TAB]) => {
  const { t } = useTranslation();
  usePageTitle(t(tab.titleKey));
};
