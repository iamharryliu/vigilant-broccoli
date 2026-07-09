import { Activity, GitBranch, LayoutGrid, Server } from 'lucide-react';
import { useTranslation } from '../i18n';
import { CardLink } from '../components/CardLink';
import { CardGrid } from '../components/CardGrid';

const ICON_CLASS = 'h-5 w-5 shrink-0';

export function HomePage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight">{t('HOME.TITLE')}</h1>
      </header>

      <CardGrid>
        <li>
          <CardLink
            route
            href="/status"
            title={t('HOME.STATUS.TITLE')}
            description={t('HOME.STATUS.DESCRIPTION')}
            icon={<Activity className={ICON_CLASS} />}
          />
        </li>
        <li>
          <CardLink
            route
            href="/open-source"
            title={t('HOME.OPEN_SOURCE.TITLE')}
            description={t('HOME.OPEN_SOURCE.DESCRIPTION')}
            icon={<GitBranch className={ICON_CLASS} />}
          />
        </li>
        <li>
          <CardLink
            route
            href="/ui"
            title={t('HOME.UI.TITLE')}
            description={t('HOME.UI.DESCRIPTION')}
            icon={<LayoutGrid className={ICON_CLASS} />}
          />
        </li>
        <li>
          <CardLink
            route
            href="/api-services"
            title={t('HOME.API_SERVICES.TITLE')}
            description={t('HOME.API_SERVICES.DESCRIPTION')}
            icon={<Server className={ICON_CLASS} />}
          />
        </li>
      </CardGrid>
    </main>
  );
}
