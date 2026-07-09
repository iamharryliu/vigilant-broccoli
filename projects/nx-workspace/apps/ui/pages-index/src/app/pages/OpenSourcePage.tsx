import { useTranslation } from '../i18n';
import { PageHeader } from '../components/PageHeader';
import { CardLink } from '../components/CardLink';
import { CardGrid } from '../components/CardGrid';
import { DockerIcon, GithubIcon, NpmIcon } from '../components/BrandIcons';

export function OpenSourcePage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <PageHeader
        title={t('OPEN_SOURCE_PAGE.TITLE')}
        description={t('OPEN_SOURCE_PAGE.DESCRIPTION')}
      />

      <CardGrid>
        <li>
          <CardLink
            href="https://github.com/iamharryliu/vigilant-broccoli"
            title={t('OPEN_SOURCE_PAGE.GITHUB.TITLE')}
            description={t('OPEN_SOURCE_PAGE.GITHUB.DESCRIPTION')}
            icon={<GithubIcon />}
          />
        </li>
        <li>
          <CardLink
            href="https://hub.docker.com/u/iamharryliu"
            title={t('OPEN_SOURCE_PAGE.DOCKER_HUB.TITLE')}
            description={t('OPEN_SOURCE_PAGE.DOCKER_HUB.DESCRIPTION')}
            icon={<DockerIcon />}
          />
        </li>
        <li>
          <CardLink
            href="https://www.npmjs.com/org/vigilant-broccoli"
            title={t('OPEN_SOURCE_PAGE.NPM.TITLE')}
            description={t('OPEN_SOURCE_PAGE.NPM.DESCRIPTION')}
            icon={<NpmIcon />}
          />
        </li>
      </CardGrid>
    </main>
  );
}
