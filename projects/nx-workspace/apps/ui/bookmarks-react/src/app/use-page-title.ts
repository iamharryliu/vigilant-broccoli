import { useDocumentTitle } from '@vigilant-broccoli/react-lib';
import { useTranslation } from './i18n';

export function usePageTitle(page: string) {
  const { t } = useTranslation();
  useDocumentTitle(`${page} | ${t('TITLE')}`);
}
