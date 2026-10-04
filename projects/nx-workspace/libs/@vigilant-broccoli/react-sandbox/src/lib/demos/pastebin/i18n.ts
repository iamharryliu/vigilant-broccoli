'use client';

import { createI18n } from '@vigilant-broccoli/react-lib';
import en from './en.json';

const LOCALE = 'en';

export const { I18nProvider, useTranslation } = createI18n({
  defaultLocale: LOCALE,
  dictionaries: { [LOCALE]: en },
});
