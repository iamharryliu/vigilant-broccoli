import { useTranslation } from '../i18n';
import { PageHeader } from '../components/PageHeader';
import { CardLink } from '../components/CardLink';

export function ApiServicesPage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <PageHeader
        title={t('API_SERVICES_PAGE.TITLE')}
        description={t('API_SERVICES_PAGE.DESCRIPTION')}
      />

      <ul className="grid gap-4 sm:grid-cols-2">
        <li>
          <CardLink
            route
            href="/api-docs"
            title={t('API_SERVICES_PAGE.API_DOCS.TITLE')}
            description={t('API_SERVICES_PAGE.API_DOCS.DESCRIPTION')}
          />
        </li>
      </ul>
    </main>
  );
}
