'use client';

import { Flex, Text, Badge, IconButton, Button } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { CardSkeleton } from './skeleton.component';
import { CardContainer } from './card-container.component';
import {
  ExternalLinkIcon,
  PlayIcon,
  StopIcon,
  PauseIcon,
} from '@radix-ui/react-icons';
import { OPEN_TYPE } from '@vigilant-broccoli/common-js';
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
      if (!response.ok) {
        throw new Error('Failed to fetch Docker container status');
      }
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

  // Open Docker.app on Mac with loading state
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
      // Backend waits 2s, now refresh the UI
      await fetchDockerStatus();
    } catch (err) {
      console.error('Failed to open Docker app:', err);
    } finally {
      setIsStartingDocker(false);
    }
  };

  // Start a container or project
  const handleStart = async (identifier: string, isProject: boolean) => {
    setActionInProgress(prev => new Set(prev).add(identifier));
    try {
      const response = await fetch(API_ENDPOINTS.DOCKER_START, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isProject ? { projectName: identifier } : { containerId: identifier },
        ),
      });

      if (!response.ok) {
        throw new Error('Failed to start container');
      }

      // Refresh the status after a short delay
      setTimeout(() => fetchDockerStatus(), 1000);
    } catch (err) {
      console.error('Failed to start container:', err);
    } finally {
      setActionInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(identifier);
        return newSet;
      });
    }
  };

  // Stop a container or project
  const handleStop = async (identifier: string, isProject: boolean) => {
    setActionInProgress(prev => new Set(prev).add(identifier));
    try {
      const response = await fetch(API_ENDPOINTS.DOCKER_STOP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isProject ? { projectName: identifier } : { containerId: identifier },
        ),
      });

      if (!response.ok) {
        throw new Error('Failed to stop container');
      }

      // Refresh the status after a short delay
      setTimeout(() => fetchDockerStatus(), 1000);
    } catch (err) {
      console.error('Failed to stop container:', err);
    } finally {
      setActionInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(identifier);
        return newSet;
      });
    }
  };

  // Determine badge color based on state
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

  // Get badge label for project state
  const getProjectBadgeLabel = (state: string): string => {
    return state === 'running' ? 'Active' : 'Inactive';
  };

  // Render control button based on state
  const renderControlButton = (
    state: string,
    identifier: string,
    isProject: boolean,
    title: string,
  ) => {
    const isRunning = state === 'running';
    const Icon = isRunning ? (isProject ? PauseIcon : StopIcon) : PlayIcon;
    const handler = isRunning ? handleStop : handleStart;
    const buttonTitle = isRunning ? `Stop ${title}` : `Start ${title}`;

    return (
      <IconButton
        size="1"
        variant="soft"
        onClick={() => handler(identifier, isProject)}
        disabled={actionInProgress.has(identifier)}
        title={buttonTitle}
      >
        <Icon />
      </IconButton>
    );
  };

  const totalCount =
    (dockerStatus?.projects.length || 0) +
    (dockerStatus?.standaloneContainers.length || 0);

  useEffect(() => {
    fetchDockerStatus();
    const interval = setInterval(fetchDockerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <CardSkeleton title="Docker Containers" rows={3} />;
  }

  if (error) {
    return (
      <CardContainer title="Docker Containers">
        <Flex direction="column" gap="3">
          <Button
            onClick={handleOpenDocker}
            loading={isStartingDocker}
            size="2"
            variant="soft"
          >
            {isStartingDocker ? 'Starting Docker...' : 'Open Docker Desktop'}
          </Button>
        </Flex>
      </CardContainer>
    );
  }

  return (
    <CardContainer
      title={`Docker Containers${dockerStatus ? ` (${totalCount})` : ''}`}
      headerAction={
        !isDockerRunning ? (
          <IconButton
            size="1"
            variant="ghost"
            onClick={handleOpenDocker}
            title="Open Docker.app"
          >
            <ExternalLinkIcon />
          </IconButton>
        ) : undefined
      }
    >
      {dockerStatus && totalCount > 0 ? (
          <Flex direction="column" gap="3">
            {dockerStatus.projects.map(project => (
              <Flex
                key={project.name}
                direction="column"
                gap="2"
                className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0"
              >
                <Flex align="center" gap="2" justify="between">
                  <Flex align="center" gap="2">
                    <Badge color={getBadgeColor(project.state)}>
                      {getProjectBadgeLabel(project.state)}
                    </Badge>
                    <Text size="3" weight="bold" className="text-gray-700">
                      {project.name}
                    </Text>
                  </Flex>
                  {renderControlButton(project.state, project.name, true, 'project')}
                </Flex>

                {project.services.length > 0 && (
                  <Flex direction="column" gap="1">
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
                  </Flex>
                )}
              </Flex>
            ))}

            {dockerStatus.standaloneContainers.map(container => (
              <Flex
                key={container.id}
                direction="column"
                gap="2"
                className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0"
              >
                <Flex align="center" gap="2" justify="between">
                  <Flex align="center" gap="2">
                    <Badge size="2" color={getBadgeColor(container.state)}>
                      {container.state.charAt(0).toUpperCase() +
                        container.state.slice(1)}
                    </Badge>
                    <Text size="3" weight="bold" className="text-gray-700">
                      {container.name}
                    </Text>
                  </Flex>
                  {renderControlButton(container.state, container.id, false, 'container')}
                </Flex>

                <Flex direction="column" gap="1" className="ml-2">
                  <Text size="1" className="text-gray-600">
                    ID:{' '}
                    <Text className="text-gray-700 font-mono">
                      {container.id.substring(0, 12)}
                    </Text>
                  </Text>
                  <Text size="1" className="text-gray-600">
                    Status:{' '}
                    <Text className="text-gray-700">{container.status}</Text>
                  </Text>
                  {container.ports && (
                    <Text size="1" className="text-gray-600">
                      Ports:{' '}
                      <Text className="text-gray-700 font-mono">
                        {container.ports}
                      </Text>
                    </Text>
                  )}
                </Flex>
              </Flex>
            ))}
          </Flex>
        ) : (
          <Text className="text-gray-500">No Docker containers found</Text>
        )}
    </CardContainer>
  );
};
