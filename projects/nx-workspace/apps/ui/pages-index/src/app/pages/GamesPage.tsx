import { PageHeader } from '../components/PageHeader';
import { CardGrid } from '../components/CardGrid';
import { PAGE_CLASS } from '../consts/layout';
import { GAMES_ROUTE } from '../consts/routes';
import WEB_APPLICATIONS from '../consts/webApplications.json';
import { useTranslation } from '../i18n';
import { ApplicationCards } from './WebApplicationsPage';

export function GamesPage() {
  const { t } = useTranslation();
  return (
    <main className={PAGE_CLASS}>
      <PageHeader title={t('GAMES_PAGE.TITLE')} route={GAMES_ROUTE} />
      <CardGrid>
        <ApplicationCards
          entries={WEB_APPLICATIONS.applications.filter(
            entry => 'game' in entry && entry.game,
          )}
          directLinks
        />
      </CardGrid>
    </main>
  );
}
