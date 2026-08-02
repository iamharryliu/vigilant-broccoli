import { useParams } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { PageHeader } from '../components/PageHeader';
import { SwaggerDocs } from '../components/SwaggerDocs';
import { findApiService, toSpecUrl } from '../consts/apiServices';

export function ApiServiceDocsPage() {
  const { t } = useTranslation();
  const { service: slug } = useParams<{ service: string }>();
  const service = findApiService(slug);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <PageHeader
        title={service ? service.slug : t('API_SERVICES_PAGE.TITLE')}
        description={
          service?.private
            ? t('API_SERVICE_DOCS_PAGE.PRIVATE_NOTICE')
            : undefined
        }
      />

      {!service && (
        <p className="text-sm text-red-500">{t('README_PAGE.NOT_FOUND')}</p>
      )}
      {service && <SwaggerDocs specUrl={toSpecUrl(service.slug)} />}
    </main>
  );
}
