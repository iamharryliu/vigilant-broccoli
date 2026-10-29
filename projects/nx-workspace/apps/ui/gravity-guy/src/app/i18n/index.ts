'use client';

import { createI18n } from '@vigilant-broccoli/react-lib';
import en from './en.json';

const DEFAULT_LOCALE = 'en';

export const { I18nProvider, useI18n, useTranslation } = createI18n({
  defaultLocale: DEFAULT_LOCALE,
  dictionaries: { [DEFAULT_LOCALE]: en },
});
