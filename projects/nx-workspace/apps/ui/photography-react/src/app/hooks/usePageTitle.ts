import { useDocumentTitle } from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';

export const usePageTitle = (pageName: string) => {
  const { t } = useTranslation();
  useDocumentTitle(`${pageName} | ${t('SITE.NAME')}`);
};
