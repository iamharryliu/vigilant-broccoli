'use client';

import { Card, Flex, Text, Badge } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { CardSkeleton } from './skeleton.component';

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

  useEffect(() => {
    const fetchWireguardStatus = async () => {
      try {
        const response = await fetch('/api/wireguard/status');
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
      <Card className="w-full">
        <Flex direction="column" gap="4" p="4">
          <Text size="5" weight="bold">WireGuard Connections</Text>
          <Text color="red">{error}</Text>
        </Flex>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <Flex direction="column" gap="4" p="4">
        <Text size="5" weight="bold">WireGuard Connections</Text>

        {wgStatus && wgStatus.connections.length > 0 ? (
          <Flex direction="column" gap="3">
            {wgStatus.connections.map((conn, idx) => (
              <Flex key={idx} direction="column" gap="2" className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                <Flex align="center" gap="2">
                  <Badge color={conn.status === 'active' ? 'green' : 'gray'} size="2">
                    {conn.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                  <Text size="3" weight="bold" className="text-gray-700">
                    {conn.name.replace('.conf', '')}
                  </Text>
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
      </Flex>
    </Card>
  );
};
