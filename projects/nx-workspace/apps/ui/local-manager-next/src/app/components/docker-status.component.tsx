'use client';
import { HTTP_METHOD, HTTP_HEADERS } from '@vigilant-broccoli/common-js';
import {
  Badge,
  Button,
  DeleteIconButton,
  IconButton,
  StatusCardListItem,
  Text,
} from '@vigilant-broccoli/react-lib';
import { useState } from 'react';
import { OPEN_TYPE } from '@vigilant-broccoli/common-js';
import { ConfirmDeleteDialog } from './confirm-delete-dialog.component';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { authFetch } from '../../../libs/auth';
import { StatusListCard } from './status-list-card.component';
import { usePolledResource } from '../hooks/usePolledResource';
import {
  DotColor,
  StatusDot,
  StatusLegendEntry,
  getDotBorder,
} from './status-dot.component';

const DOCKER_POLL_INTERVAL_MS = 30000;

interface ServiceInfo {
  name: string;
  ports: string;
}

interface DockerProject {
  name: string;
  state: 'running' | 'paused' | 'exited' | 'mixed';
  containerCount: number;
  services: ServiceInfo[];
}

interface StandaloneContainer {
  id: string;
  name: string;
  status: string;
  state:
    | 'running'
    | 'paused'
    | 'exited'
    | 'created'
    | 'restarting'
    | 'removing'
    | 'dead';
  ports: string;
}

interface DockerStatus {
  projects: DockerProject[];
  standaloneContainers: StandaloneContainer[];
}

const LEGEND: StatusLegendEntry[] = [
  { color: 'green', label: 'Running' },
  { color: 'yellow', label: 'Paused / mixed' },
  { color: 'blue', label: 'Restarting' },
  { color: 'red', label: 'Exited / dead' },
  { color: 'gray', label: 'Created / unknown' },
];

const getStateColor = (state: string): DotColor => {
  switch (state) {
    case 'running':
      return 'green';
    case 'paused':
    case 'mixed':
      return 'yellow';
    case 'exited':
    case 'removing':
    case 'dead':
      return 'red';
    case 'restarting':
      return 'blue';
    default:
      return 'gray';
  }
};

export const DockerStatusComponent = () => {
  const {
    data: dockerStatus,
    loading,
    error,
    refetch: fetchDockerStatus,
  } = usePolledResource<DockerStatus>({
    endpoint: API_ENDPOINTS.DOCKER_CONTAINERS,
    intervalMs: DOCKER_POLL_INTERVAL_MS,
    errorMessage: 'Failed to fetch Docker container status',
  });
  const [isStartingDocker, setIsStartingDocker] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<Set<string>>(
    new Set(),
  );

  const handleOpenDocker = async () => {
    setIsStartingDocker(true);
    try {
      await authFetch(API_ENDPOINTS.SHELL_EXECUTE, {
        method: HTTP_METHOD.POST,
        headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
        body: JSON.stringify({
          type: OPEN_TYPE.MAC_APPLICATION,
          target: 'Docker',
        }),
      });
      await fetchDockerStatus();
    } catch (err) {
      console.error('Failed to open Docker app:', err);
    } finally {
      setIsStartingDocker(false);
    }
  };

  const withAction = async (id: string, fn: () => Promise<Response>) => {
    setActionInProgress(prev => new Set(prev).add(id));
    try {
      const response = await fn();
      if (!response.ok) throw new Error('Action failed');
      setTimeout(fetchDockerStatus, 1000);
    } catch (err) {
      console.error('Docker action error:', err);
    } finally {
      setActionInProgress(prev => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  };

  const handleStart = (identifier: string, isProject: boolean) =>
    withAction(identifier, () =>
      authFetch(API_ENDPOINTS.DOCKER_START, {
        method: HTTP_METHOD.POST,
        headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
        body: JSON.stringify(
          isProject ? { projectName: identifier } : { containerId: identifier },
        ),
      }),
    );
  const handleStop = (identifier: string, isProject: boolean) =>
    withAction(identifier, () =>
      authFetch(API_ENDPOINTS.DOCKER_STOP, {
        method: HTTP_METHOD.POST,
        headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
        body: JSON.stringify(
          isProject ? { projectName: identifier } : { containerId: identifier },
        ),
      }),
    );
  const handleRemove = (identifier: string, isProject: boolean) =>
    withAction(identifier, () =>
      authFetch(API_ENDPOINTS.DOCKER_REMOVE, {
        method: HTTP_METHOD.POST,
        headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
        body: JSON.stringify(
          isProject ? { projectName: identifier } : { containerId: identifier },
        ),
      }),
    );

  const projectToItem = (project: DockerProject): StatusCardListItem => {
    const isRunning = project.state === 'running';
    return {
      id: project.name,
      label: project.name,
      borderClassName: getDotBorder(getStateColor(project.state)),
      badges: (
        <StatusDot color={getStateColor(project.state)} title={project.state} />
      ),
      actions: (
        <div className="flex gap-1">
          <IconButton
            icon={isRunning ? 'pause' : 'play'}
            variant="ghost"
            onClick={() =>
              isRunning
                ? handleStop(project.name, true)
                : handleStart(project.name, true)
            }
            disabled={actionInProgress.has(project.name)}
            title={isRunning ? 'Stop project' : 'Start project'}
          />
          <ConfirmDeleteDialog
            trigger={
              <DeleteIconButton
                disabled={actionInProgress.has(project.name)}
                title="Remove project"
              />
            }
            title="Remove Project"
            description={`Remove all containers for project "${project.name}"? This deletes them entirely, not just stops them.`}
            onConfirm={() => handleRemove(project.name, true)}
          />
        </div>
      ),
      children: (
        <>
          {project.services.map(service => (
            <div className="flex items-center gap-2" key={service.name}>
              <Badge color="blue" variant="soft" size="1">
                {service.name}
              </Badge>
              {service.ports && (
                <Text size="1" className="text-muted-foreground font-mono">
                  {service.ports}
                </Text>
              )}
            </div>
          ))}
        </>
      ),
    };
  };

  const containerToItem = (
    container: StandaloneContainer,
  ): StatusCardListItem => {
    const isRunning = container.state === 'running';
    return {
      id: container.id,
      label: container.name,
      borderClassName: getDotBorder(getStateColor(container.state)),
      badges: (
        <StatusDot
          color={getStateColor(container.state)}
          title={container.state}
        />
      ),
      actions: (
        <div className="flex gap-1">
          <IconButton
            icon={isRunning ? 'stop' : 'play'}
            variant="ghost"
            onClick={() =>
              isRunning
                ? handleStop(container.id, false)
                : handleStart(container.id, false)
            }
            disabled={actionInProgress.has(container.id)}
            title={isRunning ? 'Stop container' : 'Start container'}
          />
          <ConfirmDeleteDialog
            trigger={
              <DeleteIconButton
                disabled={actionInProgress.has(container.id)}
                title="Remove container"
              />
            }
            title="Remove Container"
            description={`Remove container "${container.name}"? This deletes it entirely, not just stops it.`}
            onConfirm={() => handleRemove(container.id, false)}
          />
        </div>
      ),
      children: (
        <>
          <Text size="1" color="gray">
            ID:{' '}
            <Text className="font-mono">{container.id.substring(0, 12)}</Text>
          </Text>
          <Text size="1" color="gray">
            Status: {container.status}
          </Text>
          {container.ports && (
            <Text size="1" color="gray">
              Ports: <Text className="font-mono">{container.ports}</Text>
            </Text>
          )}
        </>
      ),
    };
  };

  const items = [
    ...(dockerStatus?.projects ?? []).map(projectToItem),
    ...(dockerStatus?.standaloneContainers ?? []).map(containerToItem),
  ];

  return (
    <StatusListCard
      title={`Docker Containers${dockerStatus ? ` (${items.length})` : ''}`}
      loading={loading}
      error={error}
      legend={LEGEND}
      items={items}
      emptyMessage="No Docker containers found"
      errorContent={
        <Button
          onClick={handleOpenDocker}
          loading={isStartingDocker}
          variant="secondary"
        >
          {isStartingDocker ? 'Starting Docker...' : 'Open Docker Desktop'}
        </Button>
      }
    />
  );
};
