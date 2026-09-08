import { useTranslation } from '../i18n';
import { CardListPage, CardListItem } from '../components/CardListPage';
import { DockerIcon, GithubIcon, NpmIcon } from '../components/BrandIcons';

export function OpenSourcePage() {
  const { t } = useTranslation();

  const items: CardListItem[] = [
    {
      key: 'github',
      route: true,
      href: '/open-source/github',
      title: t('OPEN_SOURCE_PAGE.GITHUB.TITLE'),
      description: t('OPEN_SOURCE_PAGE.GITHUB.DESCRIPTION'),
      icon: <GithubIcon />,
    },
    {
      key: 'docker',
      route: true,
      href: '/open-source/docker',
      title: t('OPEN_SOURCE_PAGE.DOCKER_HUB.TITLE'),
      description: t('OPEN_SOURCE_PAGE.DOCKER_HUB.DESCRIPTION'),
      icon: <DockerIcon />,
    },
    {
      key: 'npm',
      route: true,
      href: '/open-source/npm',
      title: t('OPEN_SOURCE_PAGE.NPM.TITLE'),
      description: t('OPEN_SOURCE_PAGE.NPM.DESCRIPTION'),
      icon: <NpmIcon />,
    },
  ];

  return <CardListPage title={t('OPEN_SOURCE_PAGE.TITLE')} items={items} />;
}
