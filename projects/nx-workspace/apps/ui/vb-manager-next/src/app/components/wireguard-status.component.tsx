'use client';

import { Flex, Text, Badge, Button } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { CardSkeleton } from './skeleton.component';
import { CardContainer } from './card-container.component';
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

export const WireguardStatusComponent = () => {
  const [wgStatus, setWgStatus] = useState<WireguardStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCommand = async (connection: WireguardConnection, index: number) => {
    const configName = connection.name.replace('.conf', '');
    const command = connection.status === 'active'
      ? `sudo wg-quick down ${configName}`
      : `sudo wg-quick up ${configName}`;

    try {
      await navigator.clipboard.writeText(command);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
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
        setError(err instanceof Error ? err.message : 'Failed to fetch WireGuard status');
        setLoading(false);
        console.error('WireGuard status error:', err);
      }
    };

    fetchWireguardStatus();
    // Refresh every 10 seconds
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
          <Flex direction="column" gap="3">
            {wgStatus.connections.map((conn, idx) => (
              <Flex key={idx} direction="column" gap="2" className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                <Flex align="center" gap="2" justify="between">
                  <Flex align="center" gap="2">
                    <Badge color={conn.status === 'active' ? 'green' : 'gray'} size="2">
                      {conn.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                    <Text size="3" weight="bold" className="text-gray-700">
                      {conn.name.replace('.conf', '')}
                    </Text>
                  </Flex>
                  <Button
                    size="1"
                    variant="soft"
                    onClick={() => handleCopyCommand(conn, idx)}
                  >
                    {copiedIndex === idx ? 'Copied!' : `Copy ${conn.status === 'active' ? 'Down' : 'Up'} Command`}
                  </Button>
                </Flex>

                {conn.status === 'active' && (
                  <Flex direction="column" gap="1" className="ml-2">
                    <Text size="1" className="text-gray-600">
                      Interface: <Text className="text-gray-700">{conn.interface}</Text>
                    </Text>
                    <Text size="1" className="text-gray-600">
                      Address: <Text className="text-gray-700">{conn.address}</Text>
                    </Text>
                  </Flex>
                )}
              </Flex>
            ))}
          </Flex>
        ) : (
          <Text className="text-gray-500">No WireGuard configurations found</Text>
        )}
    </CardContainer>
  );
};
