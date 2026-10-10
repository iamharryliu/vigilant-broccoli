import { useDocumentTitle } from '@vigilant-broccoli/react-lib';
import { APP_NAME } from './app.consts';

export const usePageTitle = (pageName: string) =>
  useDocumentTitle(`${pageName} | ${APP_NAME}`);
