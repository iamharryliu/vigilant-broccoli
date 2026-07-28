'use client';

import { Card, Text, Tooltip } from '@radix-ui/themes';
import {
  CopyButton,
  MonospaceText,
  Select,
} from '@vigilant-broccoli/react-lib';
import { useEffect, useState } from 'react';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Skeleton } from './skeleton.component';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { authFetch } from '../../../libs/auth';
import { usePollingInterval } from '../hooks/usePollingInterval';

const DISK_SPACE_POLL_INTERVAL_MS = 30000;
const SPEED_TEST_POLL_INTERVAL_MS = 30000;

type SecretType = 'hex' | 'base64' | 'url-safe' | 'uuid';

interface LocalMachineStatsProps {
  diskLoading: boolean;
  diskAvailable: string;
  speedLoading: boolean;
  downloadSpeed: string;
  uploadSpeed: string;
}

const LocalMachineStats = ({
  diskLoading,
  diskAvailable,
  speedLoading,
  downloadSpeed,
  uploadSpeed,
}: LocalMachineStatsProps) => (
  <div
    className="flex flex-col gap-2"
    style={{
      borderTop: '1px solid var(--gray-5)',
      paddingTop: '12px',
      marginTop: '8px',
    }}
  >
    <div className="flex items-center gap-2">
      <Text size="2" weight="bold">
        Available disk space:
      </Text>
      {diskLoading ? (
        <Skeleton className="h-6 w-20" />
      ) : (
        <Text size="2">{diskAvailable}</Text>
      )}
    </div>
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Text size="2" weight="bold">
          Download:
        </Text>
        {speedLoading ? (
          <Skeleton className="h-6 w-24" />
        ) : (
          <Text size="2">{downloadSpeed}</Text>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Text size="2" weight="bold">
          Upload:
        </Text>
        {speedLoading ? (
          <Skeleton className="h-6 w-24" />
        ) : (
          <Text size="2">{uploadSpeed}</Text>
        )}
      </div>
    </div>
  </div>
);

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
  const [diskAvailable, setDiskAvailable] = useState<string>('');
  const [downloadSpeed, setDownloadSpeed] = useState<string>('');
  const [uploadSpeed, setUploadSpeed] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [diskLoading, setDiskLoading] = useState(true);
  const [speedLoading, setSpeedLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [secretType, setSecretType] = useState<SecretType>('hex');

  useEffect(() => {
    const fetchIpAddresses = async () => {
      try {
        setLoading(true);

        const [publicIpResponse, localIpResponse, sshKeyResponse] =
          await Promise.all([
            authFetch(API_ENDPOINTS.PUBLIC_IP)
              .then(res => res.json())
              .catch(() => ({
                success: false,
                error: 'Failed to fetch public IP',
              })),
            authFetch(API_ENDPOINTS.LOCAL_IP)
              .then(res => res.json())
              .catch(() => ({
                success: false,
                error: 'Failed to fetch local IP',
              })),
            authFetch(API_ENDPOINTS.SSH_KEY)
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

  const fetchDiskSpace = async () => {
    try {
      setDiskLoading(true);
      const response = await authFetch(API_ENDPOINTS.DISK_SPACE);
      if (!response.ok) {
        throw new Error('Failed to fetch disk space');
      }
      const data = await response.json();
      setDiskAvailable(data.available);
    } catch (err) {
      console.error('Disk space error:', err);
    } finally {
      setDiskLoading(false);
    }
  };

  usePollingInterval(fetchDiskSpace, DISK_SPACE_POLL_INTERVAL_MS);

  const fetchSpeedTest = async () => {
    try {
      setSpeedLoading(true);
      const response = await authFetch(API_ENDPOINTS.SPEED_TEST);
      if (!response.ok) {
        throw new Error('Failed to fetch speed test');
      }
      const data = await response.json();
      setDownloadSpeed(data.downloadSpeed);
      setUploadSpeed(data.uploadSpeed);
    } catch (err) {
      console.error('Speed test error:', err);
    } finally {
      setSpeedLoading(false);
    }
  };

  usePollingInterval(fetchSpeedTest, SPEED_TEST_POLL_INTERVAL_MS);

  if (error) {
    return (
      <Card className="w-full">
        <div className="flex flex-col gap-4 p-4">
          <Text size="5" weight="bold">
            IP Addresses
          </Text>
          <Text color="red">{error}</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <div className="flex flex-col gap-3 p-4">
        <div className="flex justify-between items-center gap-3">
          <Text size="5" weight="bold">
            Public IP:
          </Text>
          <MonospaceText text={publicIp} loading={loading} />
        </div>

        <div className="flex justify-between items-center gap-3">
          <Text size="5" weight="bold">
            Local IP:
          </Text>
          <MonospaceText text={localIp} loading={loading} />
        </div>

        <div className="flex justify-between items-center gap-3">
          <Text size="5" weight="bold">
            Public SSH Key:
          </Text>
          <MonospaceText text={sshKey} loading={loading} disabled={!sshKey} />
        </div>

        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <Text size="5" weight="bold">
              Secret Gen:
            </Text>
            <Select
              selectedOption={SECRET_TYPE_OPTIONS.find(
                o => o.value === secretType,
              )}
              setValue={opt => setSecretType(opt.value)}
              options={SECRET_TYPE_OPTIONS}
              optionIdenfifier="value"
              optionDisplayKey="label"
              triggerClassName="w-[100px]"
            />
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
          </div>
          <CopyButton
            disabled={loading}
            text={async () => {
              const response = await authFetch(
                `${API_ENDPOINTS.GENERATE_SECRET}?type=${secretType}`,
              );
              const data = await response.json();
              return data.success ? data.secret : '';
            }}
          />
        </div>

        <LocalMachineStats
          diskLoading={diskLoading}
          diskAvailable={diskAvailable}
          speedLoading={speedLoading}
          downloadSpeed={downloadSpeed}
          uploadSpeed={uploadSpeed}
        />
      </div>
    </Card>
  );
};
