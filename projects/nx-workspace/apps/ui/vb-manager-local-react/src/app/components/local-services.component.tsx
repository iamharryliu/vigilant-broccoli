import { Badge, StatusCardListItem, Text } from '@vigilant-broccoli/react-lib';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { StatusListCard } from './status-list-card.component';
import { usePolledResource } from '../hooks/usePolledResource';

const TITLE = 'Local Services';
const FETCH_ERROR = 'Failed to fetch local services';
const LOCAL_SERVICES_POLL_INTERVAL_MS = 30000;

interface LocalService {
  pid: number;
  name: string;
  port: number;
  protocol: 'TCP' | 'UDP';
}

const toItem = (service: LocalService): StatusCardListItem => ({
  id: `${service.port}-${service.protocol}`,
  label: `${service.name} :${service.port}`,
  badges: (
    <Badge color={service.protocol === 'TCP' ? 'blue' : 'orange'} size="1">
      {service.protocol}
    </Badge>
  ),
  children: (
    <Text size="1" color="gray">
      PID: <Text className="font-mono">{service.pid}</Text>
    </Text>
  ),
});

export const LocalServicesComponent = () => {
  const { data, loading, error } = usePolledResource<LocalService[]>({
    endpoint: API_ENDPOINTS.LOCAL_SERVICES,
    intervalMs: LOCAL_SERVICES_POLL_INTERVAL_MS,
    errorMessage: FETCH_ERROR,
  });

  return (
    <StatusListCard
      title={`${TITLE}${data ? ` (${data.length})` : ''}`}
      loading={loading}
      error={error}
      items={(data ?? []).map(toItem)}
      emptyMessage="No services exposed on 0.0.0.0"
    />
  );
};
