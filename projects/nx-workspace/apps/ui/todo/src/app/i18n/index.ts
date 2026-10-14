'use client';

import { createI18n } from '@vigilant-broccoli/react-lib';
import { en } from './en';

export const i18n = createI18n({
  en,
});

export type TFunction = typeof i18n.t;
