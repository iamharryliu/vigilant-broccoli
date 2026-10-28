'use client';

import { useDocumentTitle } from '@vigilant-broccoli/react-lib';
import { APP_NAME } from './app.const';

export const usePageTitle = (title: string) =>
  useDocumentTitle(title ? `${title} | ${APP_NAME}` : APP_NAME);
