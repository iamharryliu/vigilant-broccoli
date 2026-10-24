export const DOCKER_NAMESPACE = 'iamharryliu';

export interface DockerImageInfo {
  slug: string;
  readmePath: string;
}

export const DOCKER_IMAGES: DockerImageInfo[] = [
  {
    slug: 'bucket-service',
    readmePath: 'projects/nx-workspace/apps/api/bucket-service/README.md',
  },
  {
    slug: 'email-service',
    readmePath: 'projects/nx-workspace/apps/api/email-service/README.md',
  },
  {
    slug: 'email-subscription-service',
    readmePath:
      'projects/nx-workspace/apps/api/email-subscription-service/README.md',
  },
  {
    slug: 'employee-handler-next',
    readmePath: 'projects/nx-workspace/apps/ui/employee-handler-ui/README.md',
  },
  {
    slug: 'llm-service',
    readmePath: 'projects/nx-workspace/apps/api/llm-service/README.md',
  },
  {
    slug: 'office-presence-service',
    readmePath:
      'projects/nx-workspace/apps/api/office-presence-service/README.md',
  },
  {
    slug: 'socket-server-socketio',
    readmePath: 'projects/nx-workspace/apps/socket-server-socketio/README.md',
  },
  {
    slug: 'utilities-ui',
    readmePath: 'projects/nx-workspace/apps/ui/utilities-ui/README.md',
  },
  {
    slug: 'vb-code-server',
    readmePath: 'infrastructure/code-server/README.md',
  },
  {
    slug: 'vb-express',
    readmePath:
      'projects/nx-workspace/apps/api/vb-express/docs/features/self-hosting.md',
  },
  {
    slug: 'waiting-games',
    readmePath: 'projects/nx-workspace/apps/ui/waiting-games/README.md',
  },
];

export const toDockerImageUrl = (slug: string) =>
  `https://hub.docker.com/r/${DOCKER_NAMESPACE}/${slug}`;

export const findDockerImage = (slug?: string) =>
  DOCKER_IMAGES.find(image => image.slug === slug);
