import { useTranslation } from '../i18n';
import { CardListPage, CardListItem } from '../components/CardListPage';
import { DockerIcon } from '../components/BrandIcons';

export function DockerImagesPage() {
  const { t } = useTranslation();

  const items: CardListItem[] = [
    {
      key: 'bucket-service',
      route: true,
      href: '/open-source/docker/bucket-service',
      title: t('DOCKER_IMAGES_PAGE.BUCKET_SERVICE.TITLE'),
      description: t('DOCKER_IMAGES_PAGE.BUCKET_SERVICE.DESCRIPTION'),
      icon: <DockerIcon />,
    },
    {
      key: 'email-service',
      route: true,
      href: '/open-source/docker/email-service',
      title: t('DOCKER_IMAGES_PAGE.EMAIL_SERVICE.TITLE'),
      description: t('DOCKER_IMAGES_PAGE.EMAIL_SERVICE.DESCRIPTION'),
      icon: <DockerIcon />,
    },
    {
      key: 'email-subscription-service',
      route: true,
      href: '/open-source/docker/email-subscription-service',
      title: t('DOCKER_IMAGES_PAGE.EMAIL_SUBSCRIPTION_SERVICE.TITLE'),
      description: t(
        'DOCKER_IMAGES_PAGE.EMAIL_SUBSCRIPTION_SERVICE.DESCRIPTION',
      ),
      icon: <DockerIcon />,
    },
    {
      key: 'employee-handler-next',
      route: true,
      href: '/open-source/docker/employee-handler-next',
      title: t('DOCKER_IMAGES_PAGE.EMPLOYEE_HANDLER_NEXT.TITLE'),
      description: t('DOCKER_IMAGES_PAGE.EMPLOYEE_HANDLER_NEXT.DESCRIPTION'),
      icon: <DockerIcon />,
    },
    {
      key: 'llm-service',
      route: true,
      href: '/open-source/docker/llm-service',
      title: t('DOCKER_IMAGES_PAGE.LLM_SERVICE.TITLE'),
      description: t('DOCKER_IMAGES_PAGE.LLM_SERVICE.DESCRIPTION'),
      icon: <DockerIcon />,
    },
    {
      key: 'office-presence-service',
      route: true,
      href: '/open-source/docker/office-presence-service',
      title: t('DOCKER_IMAGES_PAGE.OFFICE_PRESENCE_SERVICE.TITLE'),
      description: t('DOCKER_IMAGES_PAGE.OFFICE_PRESENCE_SERVICE.DESCRIPTION'),
      icon: <DockerIcon />,
    },
    {
      key: 'socket-server-socketio',
      route: true,
      href: '/open-source/docker/socket-server-socketio',
      title: t('DOCKER_IMAGES_PAGE.SOCKET_SERVER_SOCKETIO.TITLE'),
      description: t('DOCKER_IMAGES_PAGE.SOCKET_SERVER_SOCKETIO.DESCRIPTION'),
      icon: <DockerIcon />,
    },
    {
      key: 'utilities-ui',
      route: true,
      href: '/open-source/docker/utilities-ui',
      title: t('DOCKER_IMAGES_PAGE.UTILITIES_UI.TITLE'),
      description: t('DOCKER_IMAGES_PAGE.UTILITIES_UI.DESCRIPTION'),
      icon: <DockerIcon />,
    },
    {
      key: 'vb-code-server',
      route: true,
      href: '/open-source/docker/vb-code-server',
      title: t('DOCKER_IMAGES_PAGE.VB_CODE_SERVER.TITLE'),
      description: t('DOCKER_IMAGES_PAGE.VB_CODE_SERVER.DESCRIPTION'),
      icon: <DockerIcon />,
    },
    {
      key: 'waiting-games',
      route: true,
      href: '/open-source/docker/waiting-games',
      title: t('DOCKER_IMAGES_PAGE.WAITING_GAMES.TITLE'),
      description: t('DOCKER_IMAGES_PAGE.WAITING_GAMES.DESCRIPTION'),
      icon: <DockerIcon />,
    },
  ];

  return <CardListPage title={t('DOCKER_IMAGES_PAGE.TITLE')} items={items} />;
}
