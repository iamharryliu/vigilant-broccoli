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
      key: 'office-presence-socket-server-demo',
      route: true,
      href: '/open-source/docker/office-presence-socket-server-demo',
      title: t('DOCKER_IMAGES_PAGE.OFFICE_PRESENCE_SOCKET_SERVER_DEMO.TITLE'),
      description: t(
        'DOCKER_IMAGES_PAGE.OFFICE_PRESENCE_SOCKET_SERVER_DEMO.DESCRIPTION',
      ),
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
  ];

  return <CardListPage title={t('DOCKER_IMAGES_PAGE.TITLE')} items={items} />;
}
