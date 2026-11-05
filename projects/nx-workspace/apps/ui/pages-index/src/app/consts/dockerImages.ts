import DOCKER_IMAGE_REGISTRY from './dockerImages.json';

export const DOCKER_NAMESPACE = 'iamharryliu';

export interface DockerImageInfo {
  slug: string;
  readmePath: string;
  descriptionKey: string;
}

// The Docker page and the /docker/:image READMEs render from dockerImages.json,
// and scripts/node/repo-stats.mjs fails when it differs from the images the
// repo's targets and workflows push, so a new image cannot skip its card.
export const DOCKER_IMAGES: DockerImageInfo[] = DOCKER_IMAGE_REGISTRY.images;

export const toDockerImageUrl = (slug: string) =>
  `https://hub.docker.com/r/${DOCKER_NAMESPACE}/${slug}`;

export const findDockerImage = (slug?: string) =>
  DOCKER_IMAGES.find(image => image.slug === slug);
