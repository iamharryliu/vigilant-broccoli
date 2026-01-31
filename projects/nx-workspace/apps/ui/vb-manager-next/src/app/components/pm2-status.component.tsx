'use client';

import { Flex, Text, Badge, IconButton } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { CardSkeleton } from './skeleton.component';
import { CardContainer } from './card-container.component';
import {
  PlayIcon,
  StopIcon,
  ReloadIcon,
} from '@radix-ui/react-icons';
import { API_ENDPOINTS } from '../constants/api-endpoints';

interface PM2Process {
  pm_id: number;
  name: string;
  status: 'online' | 'stopped' | 'errored' | 'stopping' | 'launching';
  cpu: number;
  memory: number;
  restarts: number;
  uptime: number;
}

export const PM2StatusComponent = () => {
  const [pm2Processes, setPm2Processes] = useState<PM2Process[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<Set<number>>(
    new Set(),
  );

  const fetchPM2Status = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.PM2_PROCESSES);
      if (!response.ok) {
        throw new Error('Failed to fetch PM2 process status');
      }
      const data = await response.json();
      setPm2Processes(data);
      setError(null);
      setLoading(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch PM2 process status',
      );
      setLoading(false);
      console.error('PM2 status error:', err);
    }
  };

  const handleStart = async (processId: number) => {
    setActionInProgress(prev => new Set(prev).add(processId));
    try {
      const response = await fetch(API_ENDPOINTS.PM2_START, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processId }),
      });

      if (!response.ok) {
        throw new Error('Failed to start process');
      }

      setTimeout(() => fetchPM2Status(), 1000);
    } catch (err) {
      console.error('Failed to start process:', err);
    } finally {
      setActionInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(processId);
        return newSet;
      });
    }
  };

  const handleStop = async (processId: number) => {
    setActionInProgress(prev => new Set(prev).add(processId));
    try {
      const response = await fetch(API_ENDPOINTS.PM2_STOP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processId }),
      });

      if (!response.ok) {
        throw new Error('Failed to stop process');
      }

      setTimeout(() => fetchPM2Status(), 1000);
    } catch (err) {
      console.error('Failed to stop process:', err);
    } finally {
      setActionInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(processId);
        return newSet;
      });
    }
  };

  const handleRestart = async (processId: number) => {
    setActionInProgress(prev => new Set(prev).add(processId));
    try {
      const response = await fetch(API_ENDPOINTS.PM2_RESTART, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processId }),
      });

      if (!response.ok) {
        throw new Error('Failed to restart process');
      }

      setTimeout(() => fetchPM2Status(), 1000);
    } catch (err) {
      console.error('Failed to restart process:', err);
    } finally {
      setActionInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(processId);
        return newSet;
      });
    }
  };

  const getBadgeColor = (
    status: string,
  ): 'green' | 'yellow' | 'red' | 'gray' | 'blue' => {
    switch (status) {
      case 'online':
        return 'green';
      case 'stopped':
        return 'red';
      case 'errored':
        return 'red';
      case 'stopping':
        return 'yellow';
      case 'launching':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const formatMemory = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
  };

  const formatUptime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const days = Math.floor(totalHours / 24);

    if (days > 0) {
      const hours = totalHours % 24;
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    }
    if (totalHours > 0) {
      const minutes = totalMinutes % 60;
      return minutes > 0 ? `${totalHours}h ${minutes}m` : `${totalHours}h`;
    }
    if (totalMinutes > 0) {
      const seconds = totalSeconds % 60;
      return seconds > 0 ? `${totalMinutes}m ${seconds}s` : `${totalMinutes}m`;
    }
    return `${totalSeconds}s`;
  };

  useEffect(() => {
    fetchPM2Status();
    const interval = setInterval(fetchPM2Status, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <CardSkeleton title="PM2 Processes" rows={3} />;
  }

  if (error) {
    return (
      <CardContainer title="PM2 Processes">
        <Text className="text-gray-500">{error}</Text>
      </CardContainer>
    );
  }

  const processCount = pm2Processes?.length || 0;

  return (
    <CardContainer
      title={`PM2 Processes${pm2Processes ? ` (${processCount})` : ''}`}
    >
      {pm2Processes && processCount > 0 ? (
        <Flex direction="column" gap="3">
          {pm2Processes.map(process => (
            <Flex
              key={process.pm_id}
              direction="column"
              gap="2"
              className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0"
            >
              <Flex align="center" gap="2" justify="between">
                <Flex align="center" gap="2">
                  <Badge color={getBadgeColor(process.status)}>
                    {process.status.charAt(0).toUpperCase() +
                      process.status.slice(1)}
                  </Badge>
                  <Text size="3" weight="bold" className="text-gray-700">
                    {process.name}
                  </Text>
                </Flex>
                <Flex gap="1">
                  {process.status === 'online' ? (
                    <>
                      <IconButton
                        size="1"
                        variant="soft"
                        onClick={() => handleRestart(process.pm_id)}
                        disabled={actionInProgress.has(process.pm_id)}
                        title="Restart process"
                      >
                        <ReloadIcon />
                      </IconButton>
                      <IconButton
                        size="1"
                        variant="soft"
                        onClick={() => handleStop(process.pm_id)}
                        disabled={actionInProgress.has(process.pm_id)}
                        title="Stop process"
                      >
                        <StopIcon />
                      </IconButton>
                    </>
                  ) : (
                    <IconButton
                      size="1"
                      variant="soft"
                      onClick={() => handleStart(process.pm_id)}
                      disabled={actionInProgress.has(process.pm_id)}
                      title="Start process"
                    >
                      <PlayIcon />
                    </IconButton>
                  )}
                </Flex>
              </Flex>

              <Flex direction="column" gap="1" className="ml-2">
                <Flex gap="3">
                  <Text size="1" className="text-gray-600">
                    CPU:{' '}
                    <Text className="text-gray-700 font-mono">
                      {process.cpu.toFixed(1)}%
                    </Text>
                  </Text>
                  <Text size="1" className="text-gray-600">
                    Memory:{' '}
                    <Text className="text-gray-700 font-mono">
                      {formatMemory(process.memory)}
                    </Text>
                  </Text>
                  <Text size="1" className="text-gray-600">
                    Uptime:{' '}
                    <Text className="text-gray-700 font-mono">
                      {formatUptime(process.uptime)}
                    </Text>
                  </Text>
                  <Text size="1" className="text-gray-600">
                    Restarts:{' '}
                    <Text className="text-gray-700 font-mono">
                      {process.restarts}
                    </Text>
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          ))}
        </Flex>
      ) : (
        <Text className="text-gray-500">No PM2 processes found</Text>
      )}
    </CardContainer>
  );
};
