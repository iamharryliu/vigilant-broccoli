'use client';

import { createI18n } from '@vigilant-broccoli/react-lib';
import en from './en.json';
import sv from './sv.json';

const STORAGE_KEY = 'employee-handler-ui.locale';

export const LOCALES = {
  EN: 'en',
  SV: 'sv',
} as const;

export const { I18nProvider, useI18n, useTranslation } = createI18n({
  defaultLocale: LOCALES.EN,
  dictionaries: { [LOCALES.EN]: en, [LOCALES.SV]: sv },
  storageKey: STORAGE_KEY,
});
