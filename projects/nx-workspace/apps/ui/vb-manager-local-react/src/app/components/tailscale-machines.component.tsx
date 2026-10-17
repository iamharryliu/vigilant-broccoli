import { Badge, StatusCardListItem, Text } from '@vigilant-broccoli/react-lib';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { StatusListCard } from './status-list-card.component';
import { usePolledResource } from '../hooks/usePolledResource';
import {
  DotColor,
  StatusDot,
  StatusLegendEntry,
  getDotBorder,
} from './status-dot.component';

interface TailscaleMachine {
  id: string;
  name: string;
  hostname: string;
  address: string;
  os: string;
  lastSeen: string;
  online: boolean;
  authorized: boolean;
  clientVersion: string;
  isCurrent: boolean;
}

const REFRESH_MS = 15000;
const MS_PER_MIN = 60000;
const MINS_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const TITLE = 'Tailscale Machines';
const ERR_FETCH_FAILED = 'Failed to fetch Tailscale machines';
const EMPTY_MESSAGE = 'No Tailscale machines found';

const LEGEND: StatusLegendEntry[] = [
  { color: 'green', label: 'Online' },
  { color: 'gray', label: 'Offline' },
  { color: 'red', label: 'Unauthorized' },
];

const getMachineColor = (m: TailscaleMachine): DotColor => {
  if (!m.authorized) return 'red';
  return m.online ? 'green' : 'gray';
};

const formatLastSeen = (iso: string): string => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / MS_PER_MIN);
  if (mins < 1) return 'just now';
  if (mins < MINS_PER_HOUR) return `${mins}m ago`;
  const hours = Math.floor(mins / MINS_PER_HOUR);
  if (hours < HOURS_PER_DAY) return `${hours}h ago`;
  return `${Math.floor(hours / HOURS_PER_DAY)}d ago`;
};

const toItem = (m: TailscaleMachine): StatusCardListItem => {
  const color = getMachineColor(m);
  return {
    id: m.id,
    label: m.name,
    borderClassName: getDotBorder(color),
    badges: (
      <>
        <StatusDot
          color={color}
          title={
            !m.authorized ? 'Unauthorized' : m.online ? 'Online' : 'Offline'
          }
        />
        <Badge color="blue" size="1">
          {m.os}
        </Badge>
        {m.isCurrent && (
          <Badge color="purple" size="1">
            This machine
          </Badge>
        )}
      </>
    ),
    children: (
      <>
        <Text size="1" color="gray">
          Address: {m.address}
        </Text>
        <Text size="1" color="gray">
          Host: {m.hostname}
        </Text>
        <Text size="1" color="gray">
          Last seen: {formatLastSeen(m.lastSeen)}
        </Text>
      </>
    ),
  };
};

export const TailscaleMachinesComponent = () => {
  const { data, loading, error } = usePolledResource<TailscaleMachine[]>({
    endpoint: API_ENDPOINTS.TAILSCALE_MACHINES,
    intervalMs: REFRESH_MS,
    errorMessage: ERR_FETCH_FAILED,
    select: json => json.machines ?? [],
  });

  return (
    <StatusListCard
      title={TITLE}
      loading={loading}
      error={error}
      legend={LEGEND}
      items={(data ?? []).map(toItem)}
      emptyMessage={EMPTY_MESSAGE}
    />
  );
};
