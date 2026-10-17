import {
  MonospaceText,
  StatusCardListItem,
  Text,
} from '@vigilant-broccoli/react-lib';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { StatusListCard } from './status-list-card.component';
import { usePolledResource } from '../hooks/usePolledResource';
import {
  StatusDot,
  StatusLegendEntry,
  getDotBorder,
} from './status-dot.component';

const WIREGUARD_POLL_INTERVAL_MS = 30000;

interface WireguardConnection {
  name: string;
  interface: string;
  address: string;
  status: 'active' | 'inactive';
}

interface WireguardStatus {
  connections: WireguardConnection[];
}

const LEGEND: StatusLegendEntry[] = [
  { color: 'green', label: 'Active' },
  { color: 'gray', label: 'Inactive' },
];

const toItem = (conn: WireguardConnection): StatusCardListItem => {
  const color = conn.status === 'active' ? 'green' : 'gray';
  return {
    id: conn.name,
    label: conn.name.replace('.conf', ''),
    borderClassName: getDotBorder(color),
    badges: (
      <StatusDot
        color={color}
        title={conn.status === 'active' ? 'Active' : 'Inactive'}
      />
    ),
    actions: (
      <MonospaceText
        text={`sudo wg-quick ${conn.status === 'active' ? 'down' : 'up'} ${conn.name.replace('.conf', '')}`}
        truncate={false}
      />
    ),
    children: (
      <>
        <Text size="1" color="gray">
          Interface: {conn.interface}
        </Text>
        <Text size="1" color="gray">
          Address: {conn.address}
        </Text>
      </>
    ),
  };
};

export const WireguardStatusComponent = () => {
  const { data, loading, error } = usePolledResource<WireguardStatus>({
    endpoint: API_ENDPOINTS.WIREGUARD_STATUS,
    intervalMs: WIREGUARD_POLL_INTERVAL_MS,
    errorMessage: 'Failed to fetch WireGuard status',
  });

  return (
    <StatusListCard
      title="WireGuard Connections"
      loading={loading}
      error={error}
      skeletonRows={2}
      legend={LEGEND}
      items={(data?.connections ?? []).map(toItem)}
      emptyMessage="No WireGuard configurations found"
    />
  );
};
