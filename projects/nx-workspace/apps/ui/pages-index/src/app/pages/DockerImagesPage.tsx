import { useTranslation } from '../i18n';
import { CardListPage, CardListItem } from '../components/CardListPage';
import { DockerIcon } from '../components/BrandIcons';
import { DOCKER_IMAGES } from '../consts/dockerImages';

type TranslationKey = Parameters<ReturnType<typeof useTranslation>['t']>[0];

export function DockerImagesPage() {
  const { t } = useTranslation();

  const items: CardListItem[] = DOCKER_IMAGES.map(
    ({ slug, descriptionKey }) => ({
      key: slug,
      route: true,
      href: `/docker/${slug}`,
      title: slug,
      description: t(descriptionKey as TranslationKey),
      icon: <DockerIcon />,
    }),
  );

  return <CardListPage title={t('DOCKER_IMAGES_PAGE.TITLE')} items={items} />;
}
