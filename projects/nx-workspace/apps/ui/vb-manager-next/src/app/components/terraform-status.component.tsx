'use client';

import {
  CardContainer,
  MonospaceText,
  StatusCardList,
  StatusCardListItem,
  Text,
  CardSkeleton,
} from '@vigilant-broccoli/react-lib';
import { TERRAFORM_LINK } from '@vigilant-broccoli/links';
import { useState } from 'react';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { authFetch } from '../../../libs/auth';
import { usePollingInterval } from '../hooks/usePollingInterval';
import {
  StatusDot,
  StatusLegend,
  StatusLegendEntry,
  getDotBorder,
} from './status-dot.component';

const TERRAFORM_POLL_INTERVAL_MS = 30000;
const TERRAFORM_DASHBOARD_LINK = {
  href: TERRAFORM_LINK.DASHBOARD.URL,
  label: 'Dashboard',
};

const LOGIN_COMMAND = 'terraform login';

interface TerraformAuthStatus {
  loggedIn: boolean;
  organization: string;
  workspace: string;
  username: string | null;
  email: string | null;
}

const LEGEND: StatusLegendEntry[] = [
  { color: 'green', label: 'Logged in' },
  { color: 'red', label: 'Not logged in' },
];

const toItem = (status: TerraformAuthStatus): StatusCardListItem => {
  const color = status.loggedIn ? 'green' : 'red';
  return {
    id: status.workspace,
    label: status.workspace,
    borderClassName: getDotBorder(color),
    badges: (
      <StatusDot
        color={color}
        title={status.loggedIn ? 'Logged in' : 'Not logged in'}
      />
    ),
    children: status.loggedIn ? (
      <>
        <Text size="1" color="gray">
          User: {status.username ?? status.email ?? 'Unknown'}
        </Text>
        <Text size="1" color="gray">
          Org: {status.organization}
        </Text>
      </>
    ) : (
      <MonospaceText text={LOGIN_COMMAND} truncate={true} />
    ),
  };
};

export const TerraformStatusComponent = () => {
  const [status, setStatus] = useState<TerraformAuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTerraformStatus = async () => {
    try {
      const response = await authFetch(API_ENDPOINTS.TERRAFORM_STATUS);
      if (!response.ok) throw new Error('Failed to fetch Terraform status');
      setStatus(await response.json());
      setLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch Terraform status',
      );
      setLoading(false);
    }
  };

  usePollingInterval(fetchTerraformStatus, TERRAFORM_POLL_INTERVAL_MS);

  if (loading) return <CardSkeleton title="Terraform" rows={1} />;

  if (error) {
    return (
      <CardContainer title="Terraform" headerLink={TERRAFORM_DASHBOARD_LINK}>
        <Text color="red">{error}</Text>
      </CardContainer>
    );
  }

  return (
    <CardContainer title="Terraform" headerLink={TERRAFORM_DASHBOARD_LINK}>
      <StatusCardList items={status ? [toItem(status)] : []} />
      <StatusLegend entries={LEGEND} />
    </CardContainer>
  );
};
