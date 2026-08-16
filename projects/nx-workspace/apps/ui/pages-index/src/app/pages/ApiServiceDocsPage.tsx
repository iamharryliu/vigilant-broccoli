import { useParams } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { SwaggerDocs } from '../components/SwaggerDocs';
import { findApiService, toSpecUrl } from '../consts/apiServices';

export function ApiServiceDocsPage() {
  const { t } = useTranslation();
  const { service: slug } = useParams<{ service: string }>();
  const service = findApiService(slug);

  if (!service) {
    return (
      <main className="px-4 sm:px-6 py-16">
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
