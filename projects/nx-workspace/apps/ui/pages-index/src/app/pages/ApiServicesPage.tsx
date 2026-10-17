import { Cpu, Database, Mail, MailPlus, Users } from 'lucide-react';
import { useTranslation } from '../i18n';
import { CardListPage, CardListItem } from '../components/CardListPage';
import { toApiServiceDocsHref } from '../consts/apiServices';

const ICON_CLASS = 'h-5 w-5 shrink-0';

export function ApiServicesPage() {
  const { t } = useTranslation();

  const items: CardListItem[] = [
    {
      key: 'email-service',
      icon: <Mail className={ICON_CLASS} aria-hidden="true" />,
      href: toApiServiceDocsHref('email-service'),
      title: t('API_SERVICES_PAGE.EMAIL_SERVICE.TITLE'),
      description: t('API_SERVICES_PAGE.EMAIL_SERVICE.DESCRIPTION'),
    },
    {
      key: 'email-subscription-service',
      icon: <MailPlus className={ICON_CLASS} aria-hidden="true" />,
      href: toApiServiceDocsHref('email-subscription-service'),
      title: t('API_SERVICES_PAGE.EMAIL_SUBSCRIPTION_SERVICE.TITLE'),
      description: t(
        'API_SERVICES_PAGE.EMAIL_SUBSCRIPTION_SERVICE.DESCRIPTION',
      ),
    },
    {
      key: 'llm-service',
      icon: <Cpu className={ICON_CLASS} aria-hidden="true" />,
      href: toApiServiceDocsHref('llm-service'),
      title: t('API_SERVICES_PAGE.LLM_SERVICE.TITLE'),
      description: t('API_SERVICES_PAGE.LLM_SERVICE.DESCRIPTION'),
    },
    {
      key: 'bucket-service',
      icon: <Database className={ICON_CLASS} aria-hidden="true" />,
      href: toApiServiceDocsHref('bucket-service'),
      title: t('API_SERVICES_PAGE.STORAGE_SERVICE.TITLE'),
      description: t('API_SERVICES_PAGE.STORAGE_SERVICE.DESCRIPTION'),
    },
    {
      key: 'employee-handler',
      icon: <Users className={ICON_CLASS} aria-hidden="true" />,
      href: toApiServiceDocsHref('employee-handler'),
      title: t('API_SERVICES_PAGE.EMPLOYEE_HANDLER.TITLE'),
      description: t('API_SERVICES_PAGE.EMPLOYEE_HANDLER.DESCRIPTION'),
    },
  ];

  return <CardListPage title={t('API_SERVICES_PAGE.TITLE')} items={items} />;
}
