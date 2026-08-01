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
  ];

  return (
    <CardListPage
      title={t('DOCKER_IMAGES_PAGE.TITLE')}
      description={t('DOCKER_IMAGES_PAGE.DESCRIPTION')}
      items={items}
    />
  );
}
