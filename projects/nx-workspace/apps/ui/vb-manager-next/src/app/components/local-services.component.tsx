'use client';
import { Text, Badge } from '@radix-ui/themes';
import {
  CardContainer,
  StatusCardList,
  StatusCardListItem,
} from '@vigilant-broccoli/react-lib';
import { useState } from 'react';
import { CardSkeleton } from './skeleton.component';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { authFetch } from '../../../libs/auth';
import { usePollingInterval } from '../hooks/usePollingInterval';

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
  const [services, setServices] = useState<LocalService[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      const response = await authFetch(API_ENDPOINTS.LOCAL_SERVICES);
      if (!response.ok) throw new Error(FETCH_ERROR);
      const data = await response.json();
      setServices(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : FETCH_ERROR);
    } finally {
      setLoading(false);
    }
  };

  usePollingInterval(fetchServices, LOCAL_SERVICES_POLL_INTERVAL_MS);

  if (loading) return <CardSkeleton title={TITLE} rows={3} />;

  if (error) {
    return (
      <CardContainer title={TITLE}>
        <Text className="text-gray-500">{error}</Text>
      </CardContainer>
    );
  }

  return (
    <CardContainer title={`${TITLE}${services ? ` (${services.length})` : ''}`}>
      <StatusCardList
        items={(services ?? []).map(toItem)}
        emptyMessage="No services exposed on 0.0.0.0"
      />
    </CardContainer>
  );
};
