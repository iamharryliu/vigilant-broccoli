'use client';

import { Text, Badge } from '@radix-ui/themes';
import {
  ButtonList,
  ButtonConfig,
  StatusCardList,
  StatusCardListItem,
  WINDOW_OPEN_FEATURES,
} from '@vigilant-broccoli/react-lib';
import { useEffect, useState } from 'react';
import { CardSkeleton } from './skeleton.component';
import { CardContainer } from './card-container.component';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const AWS_CONSOLE_BASE = 'https://console.aws.amazon.com';

const getProfileUrls = (region: string | null) => {
  const regionParam = region ? `?region=${region}` : '';
  return {
    iam: `${AWS_CONSOLE_BASE}/iam/home`,
    s3: `${AWS_CONSOLE_BASE}/s3/home${regionParam}`,
    ec2: `${AWS_CONSOLE_BASE}/ec2/home${regionParam}`,
    rds: `${AWS_CONSOLE_BASE}/rds/home${regionParam}`,
    secrets: `${AWS_CONSOLE_BASE}/secretsmanager/home${regionParam}`,
  };
};

const CONSOLE_LABELS: Record<string, string> = {
  iam: 'IAM',
  s3: 'S3',
  ec2: 'EC2',
  rds: 'RDS',
  secrets: 'Secrets',
};

interface AwsIdentity {
  accountId: string;
  arn: string;
  userId: string;
}

interface AwsProfile {
  name: string;
  region: string | null;
  ssoAccountId: string | null;
  ssoRoleName: string | null;
  isSso: boolean;
  identity: AwsIdentity | null;
  ssoExpired: boolean;
}

const BORDER_SSO_EXPIRED =
  'border-yellow-400 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-600';

const toItem = (profile: AwsProfile): StatusCardListItem => ({
  id: profile.name,
  label: profile.name,
  borderClassName: profile.ssoExpired ? BORDER_SSO_EXPIRED : undefined,
  badges: profile.ssoExpired ? (
    <Badge color="yellow" size="1">
      ⚠️ SSO Expired
    </Badge>
  ) : profile.isSso ? (
    <Badge color="blue" size="1">
      SSO
    </Badge>
  ) : undefined,
  children: (
    <>
      {profile.region && (
        <Text size="1" color="gray">
          Region: {profile.region}
        </Text>
      )}
      {profile.ssoAccountId && (
        <Text size="1" color="gray">
          Account: {profile.ssoAccountId}
        </Text>
      )}
      {profile.ssoRoleName && (
        <Text size="1" color="gray">
          Role: {profile.ssoRoleName}
        </Text>
      )}
      {profile.identity && (
        <Text size="1" color="gray">
          ARN: {profile.identity.arn}
        </Text>
      )}
      <ButtonList
        buttons={Object.entries(getProfileUrls(profile.region)).map(
          ([key, url]): ButtonConfig => ({
            label: CONSOLE_LABELS[key],
            onClick: () => window.open(url, '_blank', WINDOW_OPEN_FEATURES),
            isExternal: true,
          }),
        )}
      />
    </>
  ),
});

export const AwsManagementComponent = () => {
  const [profiles, setProfiles] = useState<AwsProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.AWS_PROFILES);
        if (!response.ok) throw new Error('Failed to fetch AWS profiles');
        const data = await response.json();
        setProfiles(data.profiles);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch AWS profiles',
        );
        setLoading(false);
      }
    };

    fetchProfiles();
    const interval = setInterval(fetchProfiles, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <CardSkeleton title="AWS Management" rows={3} />;

  if (error) {
    return (
      <CardContainer title="AWS Management">
        <Text color="red">{error}</Text>
      </CardContainer>
    );
  }

  return (
    <CardContainer title={`AWS Management (${profiles.length})`}>
      <StatusCardList
        items={profiles.map(toItem)}
        emptyMessage="No AWS profiles found"
      />
    </CardContainer>
  );
};
