'use client';

import { Flex, Text } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { CardSkeleton } from './skeleton.component';
import { CardContainer } from './card-container.component';
import { API_ENDPOINTS } from '../constants/api-endpoints';

interface LocalMachineStats {
  available: string;
  downloadSpeed: string;
  uploadSpeed: string;
}

export const LocalMachineComponent = () => {
  const [stats, setStats] = useState<LocalMachineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.LOCAL_MACHINE);
        if (!response.ok) {
          throw new Error('Failed to fetch local machine stats');
        }
        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch local machine stats',
        );
        setLoading(false);
        console.error('Local machine stats error:', err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <CardSkeleton title="Local Machine" rows={3} />;
  }

  if (error) {
    return (
      <CardContainer title="Local Machine">
        <Text color="red">{error}</Text>
      </CardContainer>
    );
  }

  return (
    <CardContainer title="Local Machine">
      {stats && (
        <Flex direction="column" gap="2">
          <Text size="2" className="text-gray-700">
            Available disk space: <Text weight="bold">{stats.available}</Text>
          </Text>
          <Text size="2" className="text-gray-700">
            Download: <Text weight="bold">{stats.downloadSpeed}</Text>
          </Text>
          <Text size="2" className="text-gray-700">
            Upload: <Text weight="bold">{stats.uploadSpeed}</Text>
          </Text>
        </Flex>
      )}
    </CardContainer>
  );
};
