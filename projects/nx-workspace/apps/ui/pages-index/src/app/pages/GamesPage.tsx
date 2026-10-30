import { PageHeader } from '../components/PageHeader';
import { CardGrid } from '../components/CardGrid';
import { PAGE_CLASS } from '../consts/layout';
import { GAMES_ROUTE, WEB_APPLICATIONS_ROUTE } from '../consts/routes';
import { isGamesHost, toProjectsUrl } from '../consts/hosts';
import WEB_APPLICATIONS from '../consts/webApplications.json';
import { useTranslation } from '../i18n';
import { ApplicationCards } from './WebApplicationsPage';

export function GamesPage() {
  const { t } = useTranslation();
  return (
    <main className={PAGE_CLASS}>
      <PageHeader title={t('GAMES_PAGE.TITLE')} route={GAMES_ROUTE} />
      <h1 className="text-3xl font-bold tracking-tight mb-3">
        {t('GAMES_PAGE.TITLE')}
      </h1>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        {t('GAMES_PAGE.DESCRIPTION')}
      </p>
      <CardGrid>
        <ApplicationCards
          entries={WEB_APPLICATIONS.applications.filter(
            entry => 'game' in entry && entry.game,
          )}
          games
        />
      </CardGrid>
      <a
        className="inline-block mt-8 underline underline-offset-4"
        href={
          isGamesHost()
            ? toProjectsUrl(WEB_APPLICATIONS_ROUTE)
            : `#${WEB_APPLICATIONS_ROUTE}`
        }
      >
        {t('GAMES_PAGE.ALL_APPLICATIONS')}
      </a>
    </main>
  );
}
