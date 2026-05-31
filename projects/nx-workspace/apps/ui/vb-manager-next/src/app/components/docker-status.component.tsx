'use client';

import { Flex, Text, Badge } from '@radix-ui/themes';
import {
  BORDER_ACTIVE,
  Button,
  CardContainer,
  StatusCardList,
  StatusCardListItem,
} from '@vigilant-broccoli/react-lib';
import { useEffect, useState } from 'react';
import {
  ExternalLinkIcon,
  PlayIcon,
  StopIcon,
  PauseIcon,
} from '@radix-ui/react-icons';
import { OPEN_TYPE } from '@vigilant-broccoli/common-js';
import { CardSkeleton } from './skeleton.component';
import { API_ENDPOINTS } from '../constants/api-endpoints';

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

const getBadgeColor = (
  state: string,
): 'green' | 'yellow' | 'red' | 'gray' | 'blue' | 'orange' => {
  switch (state) {
    case 'running':
      return 'green';
    case 'paused':
      return 'yellow';
    case 'exited':
      return 'red';
    case 'mixed':
      return 'orange';
    case 'created':
      return 'gray';
    case 'restarting':
      return 'blue';
    case 'removing':
    case 'dead':
      return 'orange';
    default:
      return 'gray';
  }
};

export const DockerStatusComponent = () => {
  const [dockerStatus, setDockerStatus] = useState<DockerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDockerRunning, setIsDockerRunning] = useState(false);
  const [isStartingDocker, setIsStartingDocker] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<Set<string>>(
    new Set(),
  );

  const fetchDockerStatus = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.DOCKER_CONTAINERS);
      if (!response.ok)
        throw new Error('Failed to fetch Docker container status');
      const data = await response.json();
      setDockerStatus(data);
      setIsDockerRunning(true);
      setError(null);
      setLoading(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch Docker container status',
      );
      setIsDockerRunning(false);
      setLoading(false);
      console.error('Docker status error:', err);
    }
  };

  const handleOpenDocker = async () => {
    setIsStartingDocker(true);
    try {
      await fetch(API_ENDPOINTS.SHELL_EXECUTE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      fetch(API_ENDPOINTS.DOCKER_START, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isProject ? { projectName: identifier } : { containerId: identifier },
        ),
      }),
    );
  const handleStop = (identifier: string, isProject: boolean) =>
    withAction(identifier, () =>
      fetch(API_ENDPOINTS.DOCKER_STOP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      borderClassName: isRunning ? BORDER_ACTIVE : undefined,
      badges: (
        <Badge color={getBadgeColor(project.state)} size="1">
          {isRunning ? 'Active' : 'Inactive'}
        </Badge>
      ),
      actions: (
        <Button
          size="icon"
          variant="secondary"
          onClick={() =>
            isRunning
              ? handleStop(project.name, true)
              : handleStart(project.name, true)
          }
          disabled={actionInProgress.has(project.name)}
          title={isRunning ? 'Stop project' : 'Start project'}
        >
          {isRunning ? <PauseIcon /> : <PlayIcon />}
        </Button>
      ),
      children: (
        <>
          {project.services.map(service => (
            <Flex key={service.name} align="center" gap="2">
              <Badge color="blue" variant="soft" size="1">
                {service.name}
              </Badge>
              {service.ports && (
                <Text size="1" className="text-gray-600 font-mono">
                  {service.ports}
                </Text>
              )}
            </Flex>
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
      borderClassName: isRunning ? BORDER_ACTIVE : undefined,
      badges: (
        <Badge color={getBadgeColor(container.state)} size="1">
          {container.state.charAt(0).toUpperCase() + container.state.slice(1)}
        </Badge>
      ),
      actions: (
        <Button
          size="icon"
          variant="secondary"
          onClick={() =>
            isRunning
              ? handleStop(container.id, false)
              : handleStart(container.id, false)
          }
          disabled={actionInProgress.has(container.id)}
          title={isRunning ? 'Stop container' : 'Start container'}
        >
          {isRunning ? <StopIcon /> : <PlayIcon />}
        </Button>
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

  useEffect(() => {
    fetchDockerStatus();
    const interval = setInterval(fetchDockerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <CardSkeleton title="Docker Containers" rows={3} />;

  if (error) {
    return (
      <CardContainer title="Docker Containers">
        <Button
          onClick={handleOpenDocker}
          loading={isStartingDocker}
          variant="secondary"
        >
          {isStartingDocker ? 'Starting Docker...' : 'Open Docker Desktop'}
        </Button>
      </CardContainer>
    );
  }

  const items = [
    ...(dockerStatus?.projects ?? []).map(projectToItem),
    ...(dockerStatus?.standaloneContainers ?? []).map(containerToItem),
  ];

  return (
    <CardContainer
      title={`Docker Containers${dockerStatus ? ` (${items.length})` : ''}`}
      headerAction={
        !isDockerRunning ? (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleOpenDocker}
            title="Open Docker.app"
          >
            <ExternalLinkIcon />
          </Button>
        ) : undefined
      }
    >
      <StatusCardList items={items} emptyMessage="No Docker containers found" />
    </CardContainer>
  );
};
