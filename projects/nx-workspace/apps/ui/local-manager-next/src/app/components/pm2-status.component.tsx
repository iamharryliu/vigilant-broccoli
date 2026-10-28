'use client';
import { HTTP_METHOD, HTTP_HEADERS } from '@vigilant-broccoli/common-js';
import {
  DeleteIconButton,
  IconButton,
  StatusCardListItem,
  Text,
} from '@vigilant-broccoli/react-lib';
import { useState } from 'react';
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

const PM2_POLL_INTERVAL_MS = 30000;

interface PM2Process {
  pm_id: number;
  name: string;
  status: 'online' | 'stopped' | 'errored' | 'stopping' | 'launching';
  cpu: number;
  memory: number;
  restarts: number;
  uptime: number;
}

const LEGEND: StatusLegendEntry[] = [
  { color: 'green', label: 'Online' },
  { color: 'blue', label: 'Launching' },
  { color: 'yellow', label: 'Stopping' },
  { color: 'red', label: 'Stopped / errored' },
];

const getStatusColor = (status: string): DotColor => {
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
  const {
    data: pm2Processes,
    loading,
    error,
    refetch: fetchPM2Status,
  } = usePolledResource<PM2Process[]>({
    endpoint: API_ENDPOINTS.PM2_PROCESSES,
    intervalMs: PM2_POLL_INTERVAL_MS,
    errorMessage: 'Failed to fetch PM2 process status',
  });
  const [actionInProgress, setActionInProgress] = useState<Set<number>>(
    new Set(),
  );

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
      authFetch(API_ENDPOINTS.PM2_START, {
        method: HTTP_METHOD.POST,
        headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
        body: JSON.stringify({ processId: id }),
      }),
    );
  const handleStop = (id: number) =>
    withAction(id, () =>
      authFetch(API_ENDPOINTS.PM2_STOP, {
        method: HTTP_METHOD.POST,
        headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
        body: JSON.stringify({ processId: id }),
      }),
    );
  const handleRestart = (id: number) =>
    withAction(id, () =>
      authFetch(API_ENDPOINTS.PM2_RESTART, {
        method: HTTP_METHOD.POST,
        headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
        body: JSON.stringify({ processId: id }),
      }),
    );
  const handleDelete = (id: number) =>
    withAction(id, () =>
      authFetch(API_ENDPOINTS.PM2_DELETE, {
        method: HTTP_METHOD.POST,
        headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
        body: JSON.stringify({ processId: id }),
      }),
    );

  const toItem = (process: PM2Process): StatusCardListItem => ({
    id: String(process.pm_id),
    label: process.name,
    borderClassName: getDotBorder(getStatusColor(process.status)),
    badges: (
      <StatusDot
        color={getStatusColor(process.status)}
        title={process.status.charAt(0).toUpperCase() + process.status.slice(1)}
      />
    ),
    actions: (
      <div className="flex gap-1">
        {process.status === 'online' ? (
          <>
            <IconButton
              icon="rotate-ccw"
              variant="ghost"
              onClick={() => handleRestart(process.pm_id)}
              disabled={actionInProgress.has(process.pm_id)}
              title="Restart process"
            />
            <IconButton
              icon="stop"
              variant="ghost"
              onClick={() => handleStop(process.pm_id)}
              disabled={actionInProgress.has(process.pm_id)}
              title="Stop process"
            />
          </>
        ) : (
          <IconButton
            icon="play"
            variant="ghost"
            onClick={() => handleStart(process.pm_id)}
            disabled={actionInProgress.has(process.pm_id)}
            title="Start process"
          />
        )}
        <ConfirmDeleteDialog
          trigger={
            <DeleteIconButton
              disabled={actionInProgress.has(process.pm_id)}
              title="Delete process"
            />
          }
          title="Delete Process"
          description={`Delete "${process.name}" from PM2? This removes it from the process list entirely.`}
          onConfirm={() => handleDelete(process.pm_id)}
        />
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

  return (
    <StatusListCard
      title={`PM2 Processes${pm2Processes ? ` (${pm2Processes.length})` : ''}`}
      loading={loading}
      error={error}
      legend={LEGEND}
      items={(pm2Processes ?? []).map(toItem)}
      emptyMessage="No PM2 processes found"
    />
  );
};
