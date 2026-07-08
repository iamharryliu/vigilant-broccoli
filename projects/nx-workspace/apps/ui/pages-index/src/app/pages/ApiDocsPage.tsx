import { useTranslation } from '../i18n';
import { PageHeader } from '../components/PageHeader';
import { CardLink } from '../components/CardLink';

export function ApiDocsPage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <PageHeader
        title={t('API_DOCS_PAGE.TITLE')}
        description={t('API_DOCS_PAGE.DESCRIPTION')}
      />

      <ul className="grid gap-4 sm:grid-cols-2">
        <li>
          <CardLink
            href="https://vb-llm-service.fly.dev/docs"
            title={t('API_DOCS_PAGE.LLM_SERVICE.TITLE')}
            description={t('API_DOCS_PAGE.LLM_SERVICE.DESCRIPTION')}
          />
        </li>
        <li>
          <CardLink
            href="https://vb-email-service.fly.dev/docs"
            title={t('API_DOCS_PAGE.EMAIL_SERVICE.TITLE')}
            description={t('API_DOCS_PAGE.EMAIL_SERVICE.DESCRIPTION')}
          />
        </li>
        <li>
          <CardLink
            href="https://email-subscription-service.fly.dev/docs"
            title={t('API_DOCS_PAGE.EMAIL_SUBSCRIPTION_SERVICE.TITLE')}
            description={t(
              'API_DOCS_PAGE.EMAIL_SUBSCRIPTION_SERVICE.DESCRIPTION',
            )}
          />
        </li>
        <li>
          <CardLink
            href="https://vb-storage-service.fly.dev/docs"
            title={t('API_DOCS_PAGE.STORAGE_SERVICE.TITLE')}
            description={t('API_DOCS_PAGE.STORAGE_SERVICE.DESCRIPTION')}
          />
        </li>
      </ul>
    </main>
  );
}
