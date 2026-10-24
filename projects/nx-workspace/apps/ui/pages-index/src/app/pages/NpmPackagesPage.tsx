import { useTranslation } from '../i18n';
import { CardListPage, CardListItem } from '../components/CardListPage';
import { NpmIcon } from '../components/BrandIcons';

export function NpmPackagesPage() {
  const { t } = useTranslation();

  const items: CardListItem[] = [
    {
      key: 'react-lib',
      route: true,
      href: '/npm/react-lib',
      title: t('NPM_PACKAGES_PAGE.REACT_LIB.TITLE'),
      description: t('NPM_PACKAGES_PAGE.REACT_LIB.DESCRIPTION'),
      icon: <NpmIcon />,
    },
    {
      key: 'employee-handler',
      route: true,
      href: '/npm/employee-handler',
      title: t('NPM_PACKAGES_PAGE.EMPLOYEE_HANDLER.TITLE'),
      description: t('NPM_PACKAGES_PAGE.EMPLOYEE_HANDLER.DESCRIPTION'),
      icon: <NpmIcon />,
    },
    {
      key: 'slack-workspace',
      route: true,
      href: '/npm/slack-workspace',
      title: t('NPM_PACKAGES_PAGE.SLACK_WORKSPACE.TITLE'),
      description: t('NPM_PACKAGES_PAGE.SLACK_WORKSPACE.DESCRIPTION'),
      icon: <NpmIcon />,
    },
    {
      key: 'slackbots',
      route: true,
      href: '/npm/slackbots',
      title: t('NPM_PACKAGES_PAGE.SLACKBOTS.TITLE'),
      description: t('NPM_PACKAGES_PAGE.SLACKBOTS.DESCRIPTION'),
      icon: <NpmIcon />,
    },
  ];

  return <CardListPage title={t('NPM_PACKAGES_PAGE.TITLE')} items={items} />;
}
