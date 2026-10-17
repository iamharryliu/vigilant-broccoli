import {
  MonospaceText,
  StatusCardListItem,
  Text,
} from '@vigilant-broccoli/react-lib';
import { TERRAFORM_LINK } from '@vigilant-broccoli/links';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { StatusListCard } from './status-list-card.component';
import { usePolledResource } from '../hooks/usePolledResource';
import {
  StatusDot,
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
  const { data, loading, error } = usePolledResource<TerraformAuthStatus>({
    endpoint: API_ENDPOINTS.TERRAFORM_STATUS,
    intervalMs: TERRAFORM_POLL_INTERVAL_MS,
    errorMessage: 'Failed to fetch Terraform status',
  });

  return (
    <StatusListCard
      title="Terraform"
      loading={loading}
      error={error}
      skeletonRows={1}
      headerLink={TERRAFORM_DASHBOARD_LINK}
      legend={LEGEND}
      items={data ? [toItem(data)] : []}
      emptyMessage="No Terraform status"
    />
  );
};
