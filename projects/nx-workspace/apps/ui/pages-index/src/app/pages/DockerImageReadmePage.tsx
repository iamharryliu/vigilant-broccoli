import { useParams } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { PARSE_KIND, ReadmePage } from '../components/ReadmePage';
import { findDockerImage, toDockerImageUrl } from '../consts/dockerImages';
import { toRawGithubUrl } from '../consts/repo';

export function DockerImageReadmePage() {
  const { t } = useTranslation();
  const { image: slug } = useParams<{ image: string }>();
  const image = findDockerImage(slug);

  return (
    <ReadmePage
      title={image ? image.slug : t('DOCKER_IMAGES_PAGE.TITLE')}
      source={
        image
          ? {
              url: toRawGithubUrl(image.readmePath),
              parseKind: PARSE_KIND.TEXT,
            }
          : null
      }
      externalHref={image ? toDockerImageUrl(image.slug) : undefined}
      externalLabel={t('README_PAGE.VIEW_ON_DOCKER_HUB')}
      notFoundMessage={t('README_PAGE.NOT_FOUND')}
    />
  );
}
