import { useTranslation } from '../i18n';
import { CardListPage, CardListItem } from '../components/CardListPage';
import { toApiServiceRoute } from '../consts/apiServices';

export function ApiServicesPage() {
  const { t } = useTranslation();

  const items: CardListItem[] = [
    {
      key: 'email-service',
      route: true,
      href: toApiServiceRoute('email-service'),
      title: t('API_SERVICES_PAGE.EMAIL_SERVICE.TITLE'),
      description: t('API_SERVICES_PAGE.EMAIL_SERVICE.DESCRIPTION'),
    },
    {
      key: 'email-subscription-service',
      route: true,
      href: toApiServiceRoute('email-subscription-service'),
      title: t('API_SERVICES_PAGE.EMAIL_SUBSCRIPTION_SERVICE.TITLE'),
      description: t(
        'API_SERVICES_PAGE.EMAIL_SUBSCRIPTION_SERVICE.DESCRIPTION',
      ),
    },
    {
      key: 'llm-service',
      route: true,
      href: toApiServiceRoute('llm-service'),
      title: t('API_SERVICES_PAGE.LLM_SERVICE.TITLE'),
      description: t('API_SERVICES_PAGE.LLM_SERVICE.DESCRIPTION'),
    },
    {
      key: 'bucket-service',
      route: true,
      href: toApiServiceRoute('bucket-service'),
      title: t('API_SERVICES_PAGE.STORAGE_SERVICE.TITLE'),
      description: t('API_SERVICES_PAGE.STORAGE_SERVICE.DESCRIPTION'),
    },
  ];

  return (
    <CardListPage
      title={t('API_SERVICES_PAGE.TITLE')}
      description={t('API_SERVICES_PAGE.DESCRIPTION')}
      items={items}
    />
  );
}
