'use client';

import { Flex, Text, Badge } from '@radix-ui/themes';
import { buttonVariants } from '@vigilant-broccoli/react-lib';
import { useEffect, useState } from 'react';
import { ExternalLinkIcon } from '@radix-ui/react-icons';
import { CardSkeleton } from './skeleton.component';
import { CardContainer } from './card-container.component';
import { ExpandableListItem } from './expandable-list-item.component';
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

const PROFILE_BORDER_STYLES = {
  ssoExpired:
    'border-yellow-400 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-600',
};

const ProfileBadge = ({
  ssoExpired,
  isSso,
}: {
  ssoExpired: boolean;
  isSso: boolean;
}) => {
  if (ssoExpired)
    return (
      <Badge color="yellow" size="1">
        ⚠️ SSO Expired
      </Badge>
    );
  if (isSso)
    return (
      <Badge color="blue" size="1">
        SSO
      </Badge>
    );
  return null;
};

const ProfileItem = ({
  profile,
  isExpanded,
  onToggle,
}: {
  profile: AwsProfile;
  isExpanded: boolean;
  onToggle: (name: string) => void;
}) => (
  <ExpandableListItem
    label={profile.name}
    isExpanded={isExpanded}
    onToggle={() => onToggle(profile.name)}
    borderClassName={
      profile.ssoExpired ? PROFILE_BORDER_STYLES.ssoExpired : undefined
    }
    badges={
      <ProfileBadge ssoExpired={profile.ssoExpired} isSso={profile.isSso} />
    }
  >
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
    <Flex gap="2" wrap="wrap">
      {Object.entries(getProfileUrls(profile.region)).map(([key, url]) => (
        <a key={key} href={url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
          {CONSOLE_LABELS[key]}
          <ExternalLinkIcon width="12" height="12" />
        </a>
      ))}
    </Flex>
  </ExpandableListItem>
);

export const AwsManagementComponent = () => {
  const [profiles, setProfiles] = useState<AwsProfile[]>([]);
  const [expandedProfiles, setExpandedProfiles] = useState<Set<string>>(new Set());
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

  const toggleProfile = (name: string) => {
    setExpandedProfiles(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  if (loading) return <CardSkeleton title="AWS Management" rows={3} />;

  if (error) {
    return (
      <CardContainer title="AWS Management">
        <Text color="red">{error}</Text>
      </CardContainer>
    );
  }

  return (
    <CardContainer title="AWS Management">
      <Flex direction="column" gap="2">
        <Text size="1" weight="bold">
          Profiles ({profiles.length}):
        </Text>
        <Flex direction="column" gap="1">
          {profiles.map(profile => (
            <ProfileItem
              key={profile.name}
              profile={profile}
              isExpanded={expandedProfiles.has(profile.name)}
              onToggle={toggleProfile}
            />
          ))}
        </Flex>
      </Flex>
    </CardContainer>
  );
};
