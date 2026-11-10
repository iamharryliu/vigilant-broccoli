'use client';

import { createI18n } from '@vigilant-broccoli/react-lib';
import en from './en.json';

export const { I18nProvider, useTranslation } = createI18n({
  defaultLocale: 'en',
  dictionaries: { en },
});
