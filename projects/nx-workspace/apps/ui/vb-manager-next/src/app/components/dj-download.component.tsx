'use client';

import { Card, Flex, Text, Button } from '@radix-ui/themes';
import { useState } from 'react';

export const DjDownloadComponent = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/dj/download', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start download');
      }

      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start download');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <Flex direction="column" gap="3" p="4">
        <Text size="5" weight="bold">DJ Music</Text>

        <Button
          onClick={handleDownload}
          disabled={loading}
          size="3"
          variant="solid"
        >
          {loading ? 'Starting Download...' : 'Download DJ Music'}
        </Button>

        {message && (
          <Text size="2" color="green">{message}</Text>
        )}

        {error && (
          <Text size="2" color="red">{error}</Text>
        )}
      </Flex>
    </Card>
  );
};
