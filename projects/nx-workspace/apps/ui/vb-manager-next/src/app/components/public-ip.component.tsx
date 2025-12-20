'use client';

import { Card, Flex, Text, Button } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { CopyIcon, CheckIcon } from '@radix-ui/react-icons';
import { API_ENDPOINTS } from '../constants/api-endpoints';

export const PublicIpComponent = () => {
  const [publicIp, setPublicIp] = useState<string>('');
  const [localIp, setLocalIp] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publicCopied, setPublicCopied] = useState(false);
  const [localCopied, setLocalCopied] = useState(false);

  useEffect(() => {
    const fetchIpAddresses = async () => {
      try {
        setLoading(true);

        const [publicIpResponse, localIpResponse] = await Promise.all([
          fetch(API_ENDPOINTS.PUBLIC_IP).then(res => res.json()).catch(() => ({ success: false, error: 'Failed to fetch public IP' })),
          fetch(API_ENDPOINTS.LOCAL_IP).then(res => res.json()).catch(() => ({ success: false, error: 'Failed to fetch local IP' }))
        ]);

        if (publicIpResponse.success) {
          setPublicIp(publicIpResponse.ip);
        }

        if (localIpResponse.success) {
          setLocalIp(localIpResponse.ip);
        }

        if (!publicIpResponse.success && !localIpResponse.success) {
          setError('Failed to fetch IP addresses');
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch IP addresses');
        setLoading(false);
        console.error('IP fetch error:', err);
      }
    };

    fetchIpAddresses();
  }, []);

  const handlePublicCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicIp);
      setPublicCopied(true);
      setTimeout(() => setPublicCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleLocalCopy = async () => {
    try {
      await navigator.clipboard.writeText(localIp);
      setLocalCopied(true);
      setTimeout(() => setLocalCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <Flex direction="column" gap="3" p="4">
          <Flex justify="between" align="center" gap="3">
            <Flex align="center" gap="2">
              <Text size="5" weight="bold">Public IP:</Text>
              <Text
                size="3"
                style={{
                  fontFamily: 'monospace',
                  padding: '4px 8px',
                  backgroundColor: 'var(--gray-3)',
                  borderRadius: '4px',
                  width: '120px',
                  height: '24px',
                }}
              >
              </Text>
            </Flex>
            <Button variant="soft" size="2" disabled>
              <CopyIcon /> Copy
            </Button>
          </Flex>

          <Flex justify="between" align="center" gap="3">
            <Flex align="center" gap="2">
              <Text size="5" weight="bold">Local IP:</Text>
              <Text
                size="3"
                style={{
                  fontFamily: 'monospace',
                  padding: '4px 8px',
                  backgroundColor: 'var(--gray-3)',
                  borderRadius: '4px',
                  width: '120px',
                  height: '24px',
                }}
              >
              </Text>
            </Flex>
            <Button variant="soft" size="2" disabled>
              <CopyIcon /> Copy
            </Button>
          </Flex>
        </Flex>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <Flex direction="column" gap="4" p="4">
          <Text size="5" weight="bold">IP Addresses</Text>
          <Text color="red">{error}</Text>
        </Flex>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <Flex direction="column" gap="3" p="4">
        <Flex justify="between" align="center" gap="3">
          <Flex align="center" gap="2">
            <Text size="5" weight="bold">Public IP:</Text>
            <Text
              size="3"
              style={{
                fontFamily: 'monospace',
                padding: '4px 8px',
                backgroundColor: 'var(--gray-3)',
                borderRadius: '4px',
              }}
            >
              {publicIp}
            </Text>
          </Flex>
          <Button onClick={handlePublicCopy} variant="soft" size="2">
            {publicCopied ? (
              <>
                <CheckIcon /> Copied!
              </>
            ) : (
              <>
                <CopyIcon /> Copy
              </>
            )}
          </Button>
        </Flex>

        <Flex justify="between" align="center" gap="3">
          <Flex align="center" gap="2">
            <Text size="5" weight="bold">Local IP:</Text>
            <Text
              size="3"
              style={{
                fontFamily: 'monospace',
                padding: '4px 8px',
                backgroundColor: 'var(--gray-3)',
                borderRadius: '4px',
              }}
            >
              {localIp}
            </Text>
          </Flex>
          <Button onClick={handleLocalCopy} variant="soft" size="2">
            {localCopied ? (
              <>
                <CheckIcon /> Copied!
              </>
            ) : (
              <>
                <CopyIcon /> Copy
              </>
            )}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};
