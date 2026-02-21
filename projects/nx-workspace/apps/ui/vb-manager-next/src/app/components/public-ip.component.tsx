'use client';

import { Card, Flex, Text, Button, Select, Tooltip } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { CopyIcon, CheckIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { API_ENDPOINTS } from '../constants/api-endpoints';

type SecretType = 'hex' | 'base64' | 'url-safe' | 'uuid';

const SECRET_TYPE_OPTIONS: {
  value: SecretType;
  label: string;
  description: string;
  tooltip: string;
}[] = [
  {
    value: 'hex',
    label: 'Hex',
    description: 'Hexadecimal format (64 chars)',
    tooltip: '64-character hex string. Safe for most use cases.',
  },
  {
    value: 'base64',
    label: 'Base64',
    description: 'Base64 encoded',
    tooltip: 'Base64 encoding with +, /, and = characters. Compact format.',
  },
  {
    value: 'url-safe',
    label: 'URL-Safe',
    description: 'Base64 URL-safe format',
    tooltip: 'Base64 encoding safe for URLs (replaces +, / with -, _).',
  },
  {
    value: 'uuid',
    label: 'UUID v4',
    description: 'UUID v4 format',
    tooltip: 'Standard UUID v4 format. 36 characters with hyphens.',
  },
];

export const PublicIpComponent = () => {
  const [publicIp, setPublicIp] = useState<string>('');
  const [localIp, setLocalIp] = useState<string>('');
  const [sshKey, setSshKey] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publicCopied, setPublicCopied] = useState(false);
  const [localCopied, setLocalCopied] = useState(false);
  const [sshCopied, setSshCopied] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);
  const [secretType, setSecretType] = useState<SecretType>('hex');

  useEffect(() => {
    const fetchIpAddresses = async () => {
      try {
        setLoading(true);

        const [publicIpResponse, localIpResponse, sshKeyResponse] =
          await Promise.all([
            fetch(API_ENDPOINTS.PUBLIC_IP)
              .then(res => res.json())
              .catch(() => ({
                success: false,
                error: 'Failed to fetch public IP',
              })),
            fetch(API_ENDPOINTS.LOCAL_IP)
              .then(res => res.json())
              .catch(() => ({
                success: false,
                error: 'Failed to fetch local IP',
              })),
            fetch(API_ENDPOINTS.SSH_KEY)
              .then(res => res.json())
              .catch(() => ({
                success: false,
                error: 'Failed to fetch SSH key',
              })),
          ]);

        if (publicIpResponse.success) {
          setPublicIp(publicIpResponse.ip);
        }

        if (localIpResponse.success) {
          setLocalIp(localIpResponse.ip);
        }

        if (sshKeyResponse.success) {
          setSshKey(sshKeyResponse.key);
        }

        if (
          !publicIpResponse.success &&
          !localIpResponse.success &&
          !sshKeyResponse.success
        ) {
          setError('Failed to fetch data');
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setLoading(false);
        console.error('Fetch error:', err);
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

  const handleSshCopy = async () => {
    try {
      await navigator.clipboard.writeText(sshKey);
      setSshCopied(true);
      setTimeout(() => setSshCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleGenerateSecret = async () => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.GENERATE_SECRET}?type=${secretType}`,
      );
      const data = await response.json();
      if (data.success) {
        await navigator.clipboard.writeText(data.secret);
        setSecretCopied(true);
        setTimeout(() => setSecretCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to generate secret:', err);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <Flex direction="column" gap="3" p="4">
          <Flex justify="between" align="center" gap="3">
            <Flex align="center" gap="2">
              <Text size="5" weight="bold">
                Public IP:
              </Text>
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
              ></Text>
            </Flex>
            <Button variant="soft" size="2" disabled>
              <CopyIcon /> Copy
            </Button>
          </Flex>

          <Flex justify="between" align="center" gap="3">
            <Flex align="center" gap="2">
              <Text size="5" weight="bold">
                Local IP:
              </Text>
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
              ></Text>
            </Flex>
            <Button variant="soft" size="2" disabled>
              <CopyIcon /> Copy
            </Button>
          </Flex>

          <Flex justify="between" align="center" gap="3">
            <Flex align="center" gap="2">
              <Text size="5" weight="bold">
                SSH Key:
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
          <Text size="5" weight="bold">
            IP Addresses
          </Text>
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
            <Text size="5" weight="bold">
              Public IP:
            </Text>
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
            <Text size="5" weight="bold">
              Local IP:
            </Text>
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

        <Flex justify="between" align="center" gap="3">
          <Flex align="center" gap="2">
            <Text size="5" weight="bold">
              SSH Key:
            </Text>
          </Flex>
          <Button
            onClick={handleSshCopy}
            variant="soft"
            size="2"
            disabled={!sshKey}
          >
            {sshCopied ? (
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
            <Text size="5" weight="bold">
              Secret Gen:
            </Text>
            <Select.Root
              value={secretType}
              onValueChange={value => setSecretType(value as SecretType)}
            >
              <Select.Trigger style={{ width: '100px' }} />
              <Select.Content>
                {SECRET_TYPE_OPTIONS.map(option => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            <Tooltip
              content={
                SECRET_TYPE_OPTIONS.find(o => o.value === secretType)?.tooltip
              }
            >
              <InfoCircledIcon
                width="16"
                height="16"
                style={{ cursor: 'help', color: 'var(--gray-10)' }}
              />
            </Tooltip>
          </Flex>
          <Button onClick={handleGenerateSecret} variant="soft" size="2">
            {secretCopied ? (
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
