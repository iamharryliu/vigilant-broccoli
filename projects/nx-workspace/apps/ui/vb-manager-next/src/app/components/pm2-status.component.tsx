'use client';
import { HTTP_METHOD, HTTP_HEADERS } from '@vigilant-broccoli/common-js';
import { Text, Badge } from '@radix-ui/themes';
import {
  BORDER_ACTIVE,
  Button,
  CardContainer,
  StatusCardList,
  StatusCardListItem,
} from '@vigilant-broccoli/react-lib';
import { useEffect, useState } from 'react';
import { PlayIcon, StopIcon, ReloadIcon } from '@radix-ui/react-icons';
import { CardSkeleton } from './skeleton.component';
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

const getBadgeColor = (
  status: string,
): 'green' | 'yellow' | 'red' | 'gray' | 'blue' => {
  switch (status) {
    case 'online':
      return 'green';
    case 'stopped':
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

const formatMemory = (bytes: number) =>
  `${(bytes / (1024 * 1024)).toFixed(0)} MB`;

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
      if (!response.ok) throw new Error('Failed to fetch PM2 process status');
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

  const withAction = async (processId: number, fn: () => Promise<Response>) => {
    setActionInProgress(prev => new Set(prev).add(processId));
    try {
      const response = await fn();
      if (!response.ok) throw new Error('Action failed');
      setTimeout(fetchPM2Status, 1000);
    } catch (err) {
      console.error('PM2 action error:', err);
    } finally {
      setActionInProgress(prev => {
        const s = new Set(prev);
        s.delete(processId);
        return s;
      });
    }
  };

  const handleStart = (id: number) =>
    withAction(id, () =>
      fetch(API_ENDPOINTS.PM2_START, {
        method: HTTP_METHOD.POST,
        headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
        body: JSON.stringify({ processId: id }),
      }),
    );
  const handleStop = (id: number) =>
    withAction(id, () =>
      fetch(API_ENDPOINTS.PM2_STOP, {
        method: HTTP_METHOD.POST,
        headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
        body: JSON.stringify({ processId: id }),
      }),
    );
  const handleRestart = (id: number) =>
    withAction(id, () =>
      fetch(API_ENDPOINTS.PM2_RESTART, {
        method: HTTP_METHOD.POST,
        headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
        body: JSON.stringify({ processId: id }),
      }),
    );

  const toItem = (process: PM2Process): StatusCardListItem => ({
    id: String(process.pm_id),
    label: process.name,
    borderClassName: process.status === 'online' ? BORDER_ACTIVE : undefined,
    badges: (
      <Badge color={getBadgeColor(process.status)} size="1">
        {process.status.charAt(0).toUpperCase() + process.status.slice(1)}
      </Badge>
    ),
    actions: (
      <div className="flex gap-1">
        {process.status === 'online' ? (
          <>
            <Button
              size="icon"
              variant="secondary"
              onClick={() => handleRestart(process.pm_id)}
              disabled={actionInProgress.has(process.pm_id)}
              title="Restart process"
            >
              <ReloadIcon />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={() => handleStop(process.pm_id)}
              disabled={actionInProgress.has(process.pm_id)}
              title="Stop process"
            >
              <StopIcon />
            </Button>
          </>
        ) : (
          <Button
            size="icon"
            variant="secondary"
            onClick={() => handleStart(process.pm_id)}
            disabled={actionInProgress.has(process.pm_id)}
            title="Start process"
          >
            <PlayIcon />
          </Button>
        )}
      </div>
    ),
    children: (
      <div className="flex gap-3 flex-wrap">
        <Text size="1" color="gray">
          CPU: <Text className="font-mono">{process.cpu.toFixed(1)}%</Text>
        </Text>
        <Text size="1" color="gray">
          Memory:{' '}
          <Text className="font-mono">{formatMemory(process.memory)}</Text>
        </Text>
        <Text size="1" color="gray">
          Uptime:{' '}
          <Text className="font-mono">{formatUptime(process.uptime)}</Text>
        </Text>
        <Text size="1" color="gray">
          Restarts: <Text className="font-mono">{process.restarts}</Text>
        </Text>
      </div>
    ),
  });

  useEffect(() => {
    fetchPM2Status();
    const interval = setInterval(fetchPM2Status, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <CardSkeleton title="PM2 Processes" rows={3} />;

  if (error) {
    return (
      <CardContainer title="PM2 Processes">
        <Text className="text-gray-500">{error}</Text>
      </CardContainer>
    );
  }

  return (
    <CardContainer
      title={`PM2 Processes${pm2Processes ? ` (${pm2Processes.length})` : ''}`}
    >
      <StatusCardList
        items={(pm2Processes ?? []).map(toItem)}
        emptyMessage="No PM2 processes found"
      />
    </CardContainer>
  );
};
