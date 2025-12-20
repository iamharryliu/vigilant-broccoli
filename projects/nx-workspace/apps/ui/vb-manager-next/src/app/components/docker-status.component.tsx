'use client';

import { Card, Flex, Text, Badge, IconButton, Button } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { CardSkeleton } from './skeleton.component';
import { ExternalLinkIcon } from '@radix-ui/react-icons';
import { LINK_TYPE } from '../constants/link-types';
import { API_ENDPOINTS } from '../constants/api-endpoints';

interface DockerProject {
  name: string;
  state: 'running' | 'paused' | 'exited' | 'mixed';
  containerCount: number;
  services: string[];
}

interface StandaloneContainer {
  id: string;
  name: string;
  status: string;
  state: 'running' | 'paused' | 'exited' | 'created' | 'restarting' | 'removing' | 'dead';
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
      setError(err instanceof Error ? err.message : 'Failed to fetch Docker container status');
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
          type: LINK_TYPE.MAC_APPLICATION,
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

  // Determine badge color based on state
  const getBadgeColor = (state: string): 'green' | 'yellow' | 'red' | 'gray' | 'blue' | 'orange' => {
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

  const totalCount = (dockerStatus?.projects.length || 0) + (dockerStatus?.standaloneContainers.length || 0);

  useEffect(() => {
    fetchDockerStatus();
    // Refresh every 10 seconds
    const interval = setInterval(fetchDockerStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <CardSkeleton title="Docker Containers" rows={3} />;
  }

  if (error) {
    return (
      <Card className="w-full">
        <Flex direction="column" gap="4" p="4">
          <Text size="5" weight="bold">Docker Containers</Text>
          <Flex direction="column" gap="3">
            <Text size="2" color="red">{error}</Text>
            <Button
              onClick={handleOpenDocker}
              loading={isStartingDocker}
              size="2"
              variant="soft"
            >
              {isStartingDocker ? 'Starting Docker...' : 'Open Docker Desktop'}
            </Button>
          </Flex>
        </Flex>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <Flex direction="column" gap="4" p="4">
        <Flex align="center" justify="between">
          <Text size="5" weight="bold">
            Docker Containers {dockerStatus && `(${totalCount})`}
          </Text>
          {!isDockerRunning && (
            <IconButton
              size="1"
              variant="ghost"
              onClick={handleOpenDocker}
              title="Open Docker.app"
            >
              <ExternalLinkIcon />
            </IconButton>
          )}
        </Flex>

        {dockerStatus && totalCount > 0 ? (
          <Flex direction="column" gap="3">
            {dockerStatus.projects.map((project) => (
              <Flex key={project.name} direction="column" gap="2" className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                <Flex align="center" gap="2" justify="between">
                  <Flex align="center" gap="2">
                    <Badge color={getBadgeColor(project.state)} size="2">
                      {project.state.charAt(0).toUpperCase() + project.state.slice(1)}
                    </Badge>
                    <Text size="3" weight="bold" className="text-gray-700">
                      {project.name}
                    </Text>
                  </Flex>
                  <Badge color="gray" size="1">
                    {project.containerCount} {project.containerCount === 1 ? 'image' : 'images'}
                  </Badge>
                </Flex>

                {project.services.length > 0 && (
                  <Flex gap="1" className="ml-2" wrap="wrap">
                    {project.services.map((service) => (
                      <Badge key={service} color="blue" variant="soft" size="1">
                        {service}
                      </Badge>
                    ))}
                  </Flex>
                )}
              </Flex>
            ))}

            {dockerStatus.standaloneContainers.map((container) => (
              <Flex key={container.id} direction="column" gap="2" className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                <Flex align="center" gap="2" justify="between">
                  <Flex align="center" gap="2">
                    <Badge color={getBadgeColor(container.state)} size="2">
                      {container.state.charAt(0).toUpperCase() + container.state.slice(1)}
                    </Badge>
                    <Text size="3" weight="bold" className="text-gray-700">
                      {container.name}
                    </Text>
                  </Flex>
                </Flex>

                <Flex direction="column" gap="1" className="ml-2">
                  <Text size="1" className="text-gray-600">
                    ID: <Text className="text-gray-700 font-mono">{container.id.substring(0, 12)}</Text>
                  </Text>
                  <Text size="1" className="text-gray-600">
                    Status: <Text className="text-gray-700">{container.status}</Text>
                  </Text>
                </Flex>
              </Flex>
            ))}
          </Flex>
        ) : (
          <Text className="text-gray-500">No Docker containers found</Text>
        )}
      </Flex>
    </Card>
  );
};
