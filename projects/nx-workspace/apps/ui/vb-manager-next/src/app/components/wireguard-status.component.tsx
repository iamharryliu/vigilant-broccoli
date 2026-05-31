'use client';

import { Text, Badge } from '@radix-ui/themes';
import {
  BORDER_ACTIVE,
  CardContainer,
  MonospaceText,
  StatusCardList,
  StatusCardListItem,
} from '@vigilant-broccoli/react-lib';
import { useEffect, useState } from 'react';
import { CardSkeleton } from './skeleton.component';
import { API_ENDPOINTS } from '../constants/api-endpoints';

interface WireguardConnection {
  name: string;
  interface: string;
  address: string;
  status: 'active' | 'inactive';
}

interface WireguardStatus {
  connections: WireguardConnection[];
}

const toItem = (conn: WireguardConnection): StatusCardListItem => ({
  id: conn.name,
  label: conn.name.replace('.conf', ''),
  borderClassName: conn.status === 'active' ? BORDER_ACTIVE : undefined,
  badges: (
    <Badge color={conn.status === 'active' ? 'green' : 'gray'} size="1">
      {conn.status === 'active' ? 'Active' : 'Inactive'}
    </Badge>
  ),
  actions: (
    <MonospaceText
      text={`sudo wg-quick ${conn.status === 'active' ? 'down' : 'up'} ${conn.name.replace('.conf', '')}`}
      truncate={false}
    />
  ),
  children: (
    <>
      <Text size="1" color="gray">
        Interface: {conn.interface}
      </Text>
      <Text size="1" color="gray">
        Address: {conn.address}
      </Text>
    </>
  ),
});

export const WireguardStatusComponent = () => {
  const [wgStatus, setWgStatus] = useState<WireguardStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWireguardStatus = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.WIREGUARD_STATUS);
        if (!response.ok) throw new Error('Failed to fetch WireGuard status');
        const data = await response.json();
        setWgStatus(data);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch WireGuard status',
        );
        setLoading(false);
        console.error('WireGuard status error:', err);
      }
    };

    fetchWireguardStatus();
    const interval = setInterval(fetchWireguardStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <CardSkeleton title="WireGuard Connections" rows={2} />;

  if (error) {
    return (
      <CardContainer title="WireGuard Connections">
        <Text color="red">{error}</Text>
      </CardContainer>
    );
  }

  return (
    <CardContainer title="WireGuard Connections">
      <StatusCardList
        items={(wgStatus?.connections ?? []).map(toItem)}
        emptyMessage="No WireGuard configurations found"
      />
    </CardContainer>
  );
};
