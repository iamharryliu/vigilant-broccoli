import { useParams } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { SwaggerDocs } from '../components/SwaggerDocs';
import { findApiService, toSpecUrl } from '../consts/apiServices';
import { usePageTitle } from '../use-page-title';
import { PAGE_CLASS } from '../consts/layout';

export function ApiServiceDocsPage() {
  const { t } = useTranslation();
  const { service: slug } = useParams<{ service: string }>();
  const service = findApiService(slug);
  usePageTitle(service?.slug ?? t('API_SERVICES_PAGE.TITLE'));

  if (!service) {
    return (
      <main className={PAGE_CLASS}>
        <p className="text-sm text-red-500">{t('README_PAGE.NOT_FOUND')}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <SwaggerDocs specUrl={toSpecUrl(service.slug)} />
    </main>
  );
}
