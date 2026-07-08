import { useTranslation } from '../i18n';
import { CardLink } from '../components/CardLink';

export function HomePage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight">{t('HOME.TITLE')}</h1>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        <li>
          <CardLink
            route
            href="/status"
            title={t('HOME.STATUS.TITLE')}
            description={t('HOME.STATUS.DESCRIPTION')}
          />
        </li>
        <li>
          <CardLink
            route
            href="/open-source"
            title={t('HOME.OPEN_SOURCE.TITLE')}
            description={t('HOME.OPEN_SOURCE.DESCRIPTION')}
          />
        </li>
        <li>
          <CardLink
            route
            href="/ui"
            title={t('HOME.UI.TITLE')}
            description={t('HOME.UI.DESCRIPTION')}
          />
        </li>
        <li>
          <CardLink
            route
            href="/api-services"
            title={t('HOME.API_SERVICES.TITLE')}
            description={t('HOME.API_SERVICES.DESCRIPTION')}
          />
        </li>
      </ul>
    </main>
  );
}
