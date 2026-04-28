'use client';

import { Flex, Text, Badge, Button } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { CardSkeleton } from './skeleton.component';
import { CardContainer } from './card-container.component';
import { ExpandableListItem } from './expandable-list-item.component';
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

const BORDER_STYLES = {
  active:
    'border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-700',
};

export const WireguardStatusComponent = () => {
  const [wgStatus, setWgStatus] = useState<WireguardStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedConnections, setExpandedConnections] = useState<Set<string>>(
    new Set(),
  );
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const toggleConnection = (name: string) => {
    setExpandedConnections(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleCopyCommand = async (connection: WireguardConnection) => {
    const configName = connection.name.replace('.conf', '');
    const command =
      connection.status === 'active'
        ? `sudo wg-quick down ${configName}`
        : `sudo wg-quick up ${configName}`;

    try {
      await navigator.clipboard.writeText(command);
      setCopiedName(connection.name);
      setTimeout(() => setCopiedName(null), 2000);
    } catch (err) {
      console.error('Failed to copy command:', err);
    }
  };

  useEffect(() => {
    const fetchWireguardStatus = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.WIREGUARD_STATUS);
        if (!response.ok) {
          throw new Error('Failed to fetch WireGuard status');
        }
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

  if (loading) {
    return <CardSkeleton title="WireGuard Connections" rows={2} />;
  }

  if (error) {
    return (
      <CardContainer title="WireGuard Connections">
        <Text color="red">{error}</Text>
      </CardContainer>
    );
  }

  return (
    <CardContainer title="WireGuard Connections">
      {wgStatus && wgStatus.connections.length > 0 ? (
        <Flex direction="column" gap="1">
          {wgStatus.connections.map(conn => (
            <ExpandableListItem
              key={conn.name}
              label={conn.name.replace('.conf', '')}
              labelWeight={conn.status === 'active' ? 'bold' : 'regular'}
              isExpanded={expandedConnections.has(conn.name)}
              onToggle={() => toggleConnection(conn.name)}
              borderClassName={
                conn.status === 'active' ? BORDER_STYLES.active : undefined
              }
              badges={
                <Badge
                  color={conn.status === 'active' ? 'green' : 'gray'}
                  size="1"
                >
                  {conn.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              }
              actions={
                <Button
                  size="1"
                  variant="soft"
                  onClick={() => handleCopyCommand(conn)}
                >
                  {copiedName === conn.name
                    ? 'Copied!'
                    : `Copy ${conn.status === 'active' ? 'Down' : 'Up'} Command`}
                </Button>
              }
            >
              <Text size="1" color="gray">
                Interface: {conn.interface}
              </Text>
              <Text size="1" color="gray">
                Address: {conn.address}
              </Text>
            </ExpandableListItem>
          ))}
        </Flex>
      ) : (
        <Text className="text-gray-500">
          No WireGuard configurations found
        </Text>
      )}
    </CardContainer>
  );
};
