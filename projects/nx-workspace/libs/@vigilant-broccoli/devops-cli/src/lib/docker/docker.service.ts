import { runCli, toLines } from '../cli/cli.utils';
import {
  DOCKER_ACTION,
  DOCKER_CLI,
  DockerAction,
  DockerCommand,
} from './docker.consts';

export const CONTAINER_STATE = {
  RUNNING: 'running',
  PAUSED: 'paused',
  EXITED: 'exited',
  CREATED: 'created',
  RESTARTING: 'restarting',
  REMOVING: 'removing',
  DEAD: 'dead',
} as const;

export type ContainerState =
  (typeof CONTAINER_STATE)[keyof typeof CONTAINER_STATE];

const PROJECT_STATE_MIXED = 'mixed';

export type DockerProjectState =
  | typeof CONTAINER_STATE.RUNNING
  | typeof CONTAINER_STATE.PAUSED
  | typeof CONTAINER_STATE.EXITED
  | typeof PROJECT_STATE_MIXED;

export interface DockerServiceInfo {
  name: string;
  ports: string;
}

export interface DockerProject {
  name: string;
  state: DockerProjectState;
  containerCount: number;
  services: DockerServiceInfo[];
}

export interface StandaloneContainer {
  id: string;
  name: string;
  status: string;
  state: ContainerState;
  ports: string;
}

export interface DockerStatus {
  projects: DockerProject[];
  standaloneContainers: StandaloneContainer[];
}

interface ProjectAccumulator {
  states: Set<ContainerState>;
  services: Map<string, string>;
  count: number;
}

const FIELD_SEPARATOR = '\t';
const PORT_SEPARATOR = ', ';
// Docker reports published ports as "0.0.0.0:8080->80/tcp, :::8080->80/tcp".
const PUBLISHED_PORT_PATTERN = /0\.0\.0\.0:(\d+)->/g;

const STATUS_STATES: ContainerState[] = [
  CONTAINER_STATE.PAUSED,
  CONTAINER_STATE.EXITED,
  CONTAINER_STATE.CREATED,
  CONTAINER_STATE.RESTARTING,
  CONTAINER_STATE.REMOVING,
  CONTAINER_STATE.DEAD,
];
const RUNNING_STATUS_MARKER = 'up';

const parseContainerState = (status: string): ContainerState => {
  const lowered = status.toLowerCase();
  if (lowered.includes(RUNNING_STATUS_MARKER)) return CONTAINER_STATE.RUNNING;
  return (
    STATUS_STATES.find(state => lowered.includes(state)) ??
    CONTAINER_STATE.EXITED
  );
};

const extractPublishedPorts = (ports: string): string => {
  const matches = [...ports.matchAll(PUBLISHED_PORT_PATTERN)].map(
    ([, port]) => port,
  );
  return [...new Set(matches)].join(PORT_SEPARATOR);
};

const resolveProjectState = (
  states: Set<ContainerState>,
): DockerProjectState => {
  if (states.size > 1) return PROJECT_STATE_MIXED;
  const [state] = states;
  if (
    state === CONTAINER_STATE.RUNNING ||
    state === CONTAINER_STATE.PAUSED ||
    state === CONTAINER_STATE.EXITED
  ) {
    return state;
  }
  return CONTAINER_STATE.EXITED;
};

const getStatus = async (): Promise<DockerStatus> => {
  // A failing `docker ps` means the daemon is down - no separate `docker info` precheck needed
  const { stdout } = await runCli(DOCKER_CLI, DockerCommand.listContainers);

  const projectMap = new Map<string, ProjectAccumulator>();
  const standaloneContainers: StandaloneContainer[] = [];

  for (const line of toLines(stdout)) {
    const [
      id = '',
      name = '',
      status = '',
      project = '',
      service = '',
      rawPorts = '',
    ] = line.split(FIELD_SEPARATOR).map(part => part.trim());
    const state = parseContainerState(status);
    const ports = extractPublishedPorts(rawPorts);

    if (!project) {
      standaloneContainers.push({ id, name, status, state, ports });
      continue;
    }

    const accumulator = projectMap.get(project) ?? {
      states: new Set<ContainerState>(),
      services: new Map<string, string>(),
      count: 0,
    };
    accumulator.states.add(state);
    if (service) accumulator.services.set(service, ports);
    accumulator.count++;
    projectMap.set(project, accumulator);
  }

  const projects = [...projectMap.entries()].map(([name, accumulator]) => ({
    name,
    state: resolveProjectState(accumulator.states),
    containerCount: accumulator.count,
    services: [...accumulator.services.entries()]
      .map(([serviceName, ports]) => ({ name: serviceName, ports }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));

  return { projects, standaloneContainers };
};

const listProjectContainerIds = async (
  projectName: string,
): Promise<string[]> => {
  const { stdout } = await runCli(
    DOCKER_CLI,
    DockerCommand.listProjectContainerIds(projectName),
  );
  return toLines(stdout);
};

const ACTION_COMMAND: Record<DockerAction, (ids: string[]) => string[]> = {
  [DOCKER_ACTION.START]: DockerCommand.start,
  [DOCKER_ACTION.STOP]: DockerCommand.stop,
  [DOCKER_ACTION.REMOVE]: DockerCommand.remove,
};

const runContainerAction = async (
  action: DockerAction,
  containerIds: string[],
): Promise<void> => {
  await runCli(DOCKER_CLI, ACTION_COMMAND[action](containerIds));
};

export const DockerService = {
  getStatus,
  listProjectContainerIds,
  runContainerAction,
};
