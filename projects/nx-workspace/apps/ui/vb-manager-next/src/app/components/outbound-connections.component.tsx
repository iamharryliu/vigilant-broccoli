'use client';

import { Text, Badge } from '@radix-ui/themes';
import {
  CardContainer,
  StatusCardList,
  StatusCardListItem,
} from '@vigilant-broccoli/react-lib';
import { useEffect, useState } from 'react';
import { CardSkeleton } from './skeleton.component';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  CONNECTION_SCOPE,
  ConnectionScope,
} from '../constants/network-monitor';
import { authFetch } from '../../../libs/auth';

const TITLE = 'Outbound Connections';
const REFRESH_MS = 15000;
const FETCH_ERROR = 'Failed to fetch outbound connections';
const EMPTY_MESSAGE = 'No established outbound connections';
const EXTERNAL_LABEL_SUFFIX = 'external';

interface OutboundConnection {
  pid: number;
  name: string;
  localIp: string;
  localPort: number;
  remoteIp: string;
  remotePort: number;
  scope: ConnectionScope;
}

const SCOPE_COLOR: Record<ConnectionScope, 'red' | 'amber' | 'gray'> = {
  [CONNECTION_SCOPE.EXTERNAL]: 'red',
  [CONNECTION_SCOPE.PRIVATE]: 'amber',
  [CONNECTION_SCOPE.LOOPBACK]: 'gray',
};

const toItem = (c: OutboundConnection): StatusCardListItem => ({
  id: `${c.pid}-${c.localPort}-${c.remoteIp}:${c.remotePort}`,
  label: `${c.name} → ${c.remoteIp}:${c.remotePort}`,
  badges: (
    <Badge color={SCOPE_COLOR[c.scope]} size="1">
      {c.scope}
    </Badge>
  ),
  children: (
    <Text size="1" color="gray">
      PID: <Text className="font-mono">{c.pid}</Text> · local{' '}
      <Text className="font-mono">
        {c.localIp}:{c.localPort}
      </Text>
    </Text>
  ),
});

export const OutboundConnectionsComponent = () => {
  const [connections, setConnections] = useState<OutboundConnection[] | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = async () => {
    try {
      const res = await authFetch(
        API_ENDPOINTS.NETWORK_MONITOR_OUTBOUND_CONNECTIONS,
      );
      if (!res.ok) throw new Error(FETCH_ERROR);
      const data = await res.json();
      setConnections(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : FETCH_ERROR);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
    const interval = setInterval(fetchConnections, REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <CardSkeleton title={TITLE} rows={4} />;

  if (error) {
    return (
      <CardContainer title={TITLE}>
        <Text color="red">{error}</Text>
      </CardContainer>
    );
  }

  const externalCount = (connections ?? []).filter(
    c => c.scope === CONNECTION_SCOPE.EXTERNAL,
  ).length;

  return (
    <CardContainer
      title={`${TITLE}${connections ? ` (${connections.length}, ${externalCount} ${EXTERNAL_LABEL_SUFFIX})` : ''}`}
    >
      <StatusCardList
        items={(connections ?? []).map(toItem)}
        emptyMessage={EMPTY_MESSAGE}
      />
    </CardContainer>
  );
};
