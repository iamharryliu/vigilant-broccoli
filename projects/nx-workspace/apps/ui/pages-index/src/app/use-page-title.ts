import { useDocumentTitle } from '@vigilant-broccoli/react-lib';
import { useTranslation } from './i18n';

export const usePageTitle = (title: string) => {
  const { t } = useTranslation();
  useDocumentTitle(`${title} | ${t('HOME.TITLE')}`);
};
