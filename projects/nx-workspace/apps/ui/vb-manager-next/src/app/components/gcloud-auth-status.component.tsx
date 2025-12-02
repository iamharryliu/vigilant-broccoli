'use client';

import { Card, Flex, Text, Badge } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { CardSkeleton } from './skeleton.component';

interface GcloudAccount {
  account: string;
  status: string;
}

interface GcloudAuthStatus {
  activeAccount: string | null;
  accounts: GcloudAccount[];
  currentProject: string | null;
}

export const GcloudAuthStatusComponent = () => {
  const [authStatus, setAuthStatus] = useState<GcloudAuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGcloudStatus = async () => {
      try {
        const response = await fetch('/api/gcloud/auth-status');
        if (!response.ok) {
          throw new Error('Failed to fetch gcloud auth status');
        }
        const data = await response.json();
        setAuthStatus(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch gcloud status');
        setLoading(false);
        console.error('Gcloud auth status error:', err);
      }
    };

    fetchGcloudStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchGcloudStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <CardSkeleton title="GCloud Auth Status" rows={3} />;
  }

  if (error) {
    return (
      <Card className="w-full">
        <Flex direction="column" gap="4" p="4">
          <Text size="5" weight="bold">GCloud Auth Status</Text>
          <Text color="red">{error}</Text>
        </Flex>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <Flex direction="column" gap="4" p="4">
        <Text size="5" weight="bold">GCloud Auth Status</Text>

        {authStatus?.activeAccount ? (
          <Flex direction="column" gap="3">
            <Flex align="center" gap="2">
              <Badge color="green" size="2">Active</Badge>
              <Text size="2" className="text-gray-700">{authStatus.activeAccount}</Text>
            </Flex>

            {authStatus.currentProject && (
              <Flex direction="column" gap="1">
                <Text size="1" weight="bold" className="text-gray-600">Current Project:</Text>
                <Text size="2" className="text-gray-700">{authStatus.currentProject}</Text>
              </Flex>
            )}

            {authStatus.accounts.length > 1 && (
              <Flex direction="column" gap="2">
                <Text size="1" weight="bold" className="text-gray-600">Other Accounts:</Text>
                {authStatus.accounts
                  .filter(acc => acc.account !== authStatus.activeAccount)
                  .map((acc, idx) => (
                    <Flex key={idx} align="center" gap="2">
                      <Badge color="gray" size="1">Inactive</Badge>
                      <Text size="2" className="text-gray-500">{acc.account}</Text>
                    </Flex>
                  ))}
              </Flex>
            )}
          </Flex>
        ) : (
          <Flex align="center" gap="2">
            <Badge color="red" size="2">Not Authenticated</Badge>
            <Text size="2" className="text-gray-500">No active gcloud account</Text>
          </Flex>
        )}
      </Flex>
    </Card>
  );
};
