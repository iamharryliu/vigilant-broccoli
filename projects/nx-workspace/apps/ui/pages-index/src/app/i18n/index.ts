'use client';

import { createI18n } from '@vigilant-broccoli/react-lib';
import en from './en.json';

const STORAGE_KEY = 'pages-index.locale';

export const LOCALES = {
  EN: 'en',
} as const;

export const { I18nProvider, useI18n, useTranslation } = createI18n({
  defaultLocale: LOCALES.EN,
  dictionaries: { [LOCALES.EN]: en },
  storageKey: STORAGE_KEY,
});
