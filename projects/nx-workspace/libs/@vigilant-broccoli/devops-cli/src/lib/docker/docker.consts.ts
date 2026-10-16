export const DOCKER_CLI = 'docker';

const COMPOSE_PROJECT_LABEL = 'com.docker.compose.project';
const COMPOSE_SERVICE_LABEL = 'com.docker.compose.service';
const CONTAINER_FORMAT = [
  '{{.ID}}',
  '{{.Names}}',
  '{{.Status}}',
  `{{.Label "${COMPOSE_PROJECT_LABEL}"}}`,
  `{{.Label "${COMPOSE_SERVICE_LABEL}"}}`,
  '{{.Ports}}',
].join('\t');
const ID_FORMAT = '{{.ID}}';

export const DockerCommand = {
  listContainers: ['ps', '-a', '--format', CONTAINER_FORMAT],
  listProjectContainerIds: (projectName: string) => [
    'ps',
    '-a',
    '--filter',
    `label=${COMPOSE_PROJECT_LABEL}=${projectName}`,
    '--format',
    ID_FORMAT,
  ],
  start: (containerIds: string[]) => ['start', ...containerIds],
  stop: (containerIds: string[]) => ['stop', ...containerIds],
  remove: (containerIds: string[]) => ['rm', '-f', ...containerIds],
} as const;

export const DOCKER_ACTION = {
  START: 'start',
  STOP: 'stop',
  REMOVE: 'remove',
} as const;

export type DockerAction = (typeof DOCKER_ACTION)[keyof typeof DOCKER_ACTION];

const DOCKER_NAME_PATTERN = /^[\w.-]+$/;

export const isValidDockerName = (value: string): boolean =>
  DOCKER_NAME_PATTERN.test(value);
