import { useTranslation } from '../i18n';
import { PageHeader } from '../components/PageHeader';
import { CardLink } from '../components/CardLink';
import { CardGrid } from '../components/CardGrid';

export function ApiServicesPage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <PageHeader
        title={t('API_SERVICES_PAGE.TITLE')}
        description={t('API_SERVICES_PAGE.DESCRIPTION')}
      />

      <CardGrid>
        <li>
          <CardLink
            href="https://staging-vb-email-service.fly.dev/docs"
            title={t('API_SERVICES_PAGE.EMAIL_SERVICE.TITLE')}
            description={t('API_SERVICES_PAGE.EMAIL_SERVICE.DESCRIPTION')}
          />
        </li>
        <li>
          <CardLink
            href="https://staging-email-subscription-service.fly.dev/docs"
            title={t('API_SERVICES_PAGE.EMAIL_SUBSCRIPTION_SERVICE.TITLE')}
            description={t(
              'API_SERVICES_PAGE.EMAIL_SUBSCRIPTION_SERVICE.DESCRIPTION',
            )}
          />
        </li>
      </CardGrid>
    </main>
  );
}
