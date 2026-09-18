import { useTranslation } from '../i18n';
import { CardListPage, CardListItem } from '../components/CardListPage';
import { GithubIcon } from '../components/BrandIcons';

export function GithubReposPage() {
  const { t } = useTranslation();

  const items: CardListItem[] = [
    {
      key: 'vigilant-broccoli',
      route: true,
      href: '/open-source/github/vigilant-broccoli',
      title: t('GITHUB_REPOS_PAGE.VIGILANT_BROCCOLI.TITLE'),
      description: t('GITHUB_REPOS_PAGE.VIGILANT_BROCCOLI.DESCRIPTION'),
      icon: <GithubIcon />,
    },
  ];

  return <CardListPage title={t('GITHUB_REPOS_PAGE.TITLE')} items={items} />;
}
