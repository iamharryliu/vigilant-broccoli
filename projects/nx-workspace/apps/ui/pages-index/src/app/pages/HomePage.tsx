import {
  Gamepad2,
  Activity,
  Bot,
  ChartColumn,
  FileText,
  GitPullRequestArrow,
  Globe,
  LayoutGrid,
  Server,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { CardLink } from '../components/CardLink';
import { CardGrid } from '../components/CardGrid';
import { SectionHeading } from '../components/SectionHeading';
import { DockerIcon, GithubIcon, NpmIcon } from '../components/BrandIcons';
import { usePageTitle } from '../use-page-title';
import { PAGE_CLASS } from '../consts/layout';
import { GAMES_ROUTE } from '../consts/routes';

const ICON_CLASS = 'h-5 w-5 shrink-0';

export function HomePage() {
  const { t } = useTranslation();
  usePageTitle(t('HOME.PAGE_TITLE'));

  return (
    <main className={PAGE_CLASS}>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{t('HOME.TITLE')}</h1>
      </header>

      <section className="mb-8">
        <CardGrid>
          <li>
            <CardLink
              route
              href="/github/vigilant-broccoli"
              title={t('HOME.README.TITLE')}
              description={t('HOME.README.DESCRIPTION')}
              icon={<FileText className={ICON_CLASS} />}
            />
          </li>
          <li>
            <CardLink
              href="https://context.harryliu.dev/"
              title={t('HOME.CLAUDE_CONTEXT.TITLE')}
              description={t('HOME.CLAUDE_CONTEXT.DESCRIPTION')}
              icon={<Bot className={ICON_CLASS} />}
            />
          </li>
        </CardGrid>
      </section>

      <section className="mb-8">
        <SectionHeading>{t('HOME.SECTION_MONITORING')}</SectionHeading>
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
              href="/deployments"
              title={t('HOME.DEPLOYMENTS.TITLE')}
              description={t('HOME.DEPLOYMENTS.DESCRIPTION')}
              icon={<GitPullRequestArrow className={ICON_CLASS} />}
            />
          </li>
          <li>
            <CardLink
              route
              href="/repo-timeline"
              title={t('HOME.REPO_TIMELINE.TITLE')}
              description={t('HOME.REPO_TIMELINE.DESCRIPTION')}
              icon={<ChartColumn className={ICON_CLASS} />}
            />
          </li>
        </CardGrid>
      </section>

      <section>
        <SectionHeading>{t('HOME.SECTION_SOFTWARE_PROJECTS')}</SectionHeading>
        <CardGrid>
          <li>
            <CardLink
              route
              href={GAMES_ROUTE}
              title={t('GAMES_PAGE.TITLE')}
              description={t('GAMES_PAGE.DESCRIPTION')}
              icon={<Gamepad2 className={ICON_CLASS} />}
            />
          </li>
          <li>
            <CardLink
              route
              href="/github"
              title={t('HOME.GITHUB.TITLE')}
              description={t('HOME.GITHUB.DESCRIPTION')}
              icon={<GithubIcon />}
            />
          </li>
          <li>
            <CardLink
              route
              href="/docker"
              title={t('HOME.DOCKER_HUB.TITLE')}
              description={t('HOME.DOCKER_HUB.DESCRIPTION')}
              icon={<DockerIcon />}
            />
          </li>
          <li>
            <CardLink
              route
              href="/npm"
              title={t('HOME.NPM.TITLE')}
              description={t('HOME.NPM.DESCRIPTION')}
              icon={<NpmIcon />}
            />
          </li>
          <li>
            <CardLink
              route
              href="/web-applications"
              title={t('HOME.WEB_APPLICATIONS.TITLE')}
              description={t('HOME.WEB_APPLICATIONS.DESCRIPTION')}
              icon={<Globe className={ICON_CLASS} />}
            />
          </li>
          <li>
            <CardLink
              href="https://components.harryliu.dev/"
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
      </section>
    </main>
  );
}
