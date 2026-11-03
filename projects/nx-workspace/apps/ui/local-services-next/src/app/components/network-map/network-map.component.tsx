'use client';

import { useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Badge,
  Button,
  CardContainer,
  CardSkeleton,
  Select,
  Text,
  cn,
} from '@vigilant-broccoli/react-lib';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import {
  CONNECTION_DIRECTION,
  CONNECTION_MAP_WINDOW,
  CONNECTION_MAP_WINDOW_PARAM,
  ConnectionDirection,
  ConnectionMapWindow,
  ConnectionFlow,
  ConnectionMapResponse,
  GEO_STATUS,
} from '../../constants/network-monitor';
import { authFetch } from '../../../../libs/auth';
import { usePollingInterval } from '../../hooks/usePollingInterval';
import {
  formatAge,
  formatBytes,
  formatRate,
  formatPlace,
  groupByDestination,
} from './network-map.utils';

// Leaflet touches `window` on import.
const ConnectionWorldMap = dynamic(
  () => import('./connection-world-map').then(m => m.ConnectionWorldMap),
  { ssr: false },
);

const TITLE = 'Connection Map';
const POLL_MS = 5000;
const FETCH_ERROR = 'Failed to read connections';
const COLLECTOR_ERROR_PREFIX = 'Collector error: ';
const ALL_PROCESSES = 'All processes';
const EMPTY_MESSAGE = 'No external connections in this window';
const DEFAULT_WINDOW: ConnectionMapWindow = '15m';
const WINDOW_OPTIONS = Object.keys(
  CONNECTION_MAP_WINDOW,
) as ConnectionMapWindow[];
const GEO_STATUS_MESSAGE: Partial<Record<string, string>> = {
  [GEO_STATUS.LOADING]:
    'Downloading the DB-IP Lite database (~60MB, first run only); locations appear when it finishes.',
  [GEO_STATUS.ERROR]:
    'GeoIP database failed to load; connections are listed without locations.',
};
const DIRECTION_FILTER = {
  ALL: 'all',
  ...CONNECTION_DIRECTION,
} as const;
type DirectionFilter = (typeof DIRECTION_FILTER)[keyof typeof DIRECTION_FILTER];

const DIRECTION_BADGE_COLOR: Record<ConnectionDirection, 'blue' | 'orange'> = {
  [CONNECTION_DIRECTION.OUTBOUND]: 'blue',
  [CONNECTION_DIRECTION.INBOUND]: 'orange',
};

const flowEndpoint = (flow: ConnectionFlow) =>
  flow.direction === CONNECTION_DIRECTION.INBOUND
    ? `${flow.remoteIp} → :${flow.localPort}`
    : `${flow.remoteIp}:${flow.remotePort}`;

const flowStatus = (flow: ConnectionFlow, now: number) => {
  if (flow.sockets === 0) return formatAge(now - flow.lastSeen);
  if (flow.rateIn === 0 && flow.rateOut === 0) return `${flow.sockets} open`;
  return `↓ ${formatRate(flow.rateIn)} ↑ ${formatRate(flow.rateOut)}`;
};

const FlowRow = ({
  flow,
  now,
  selected,
  onSelect,
}: {
  flow: ConnectionFlow;
  now: number;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={onSelect}
    className={cn(
      'w-full text-left px-2 py-1.5 rounded-md flex flex-col gap-0.5 hover:bg-accent',
      selected && 'bg-accent',
    )}
  >
    <div className="flex items-center gap-2 min-w-0">
      <span
        className={cn(
          'h-2 w-2 shrink-0 rounded-full',
          flow.sockets > 0 ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-500',
        )}
      />
      <Text size="2" className="truncate font-medium">
        {flow.process}
      </Text>
      <Badge color={DIRECTION_BADGE_COLOR[flow.direction]} size="1">
        {flow.direction}
      </Badge>
      <Text size="1" color="gray" className="ml-auto shrink-0">
        {flowStatus(flow, now)}
      </Text>
    </div>
    <Text size="1" color="gray" className="truncate">
      <span className="font-mono">{flowEndpoint(flow)}</span> · {flow.protocol}{' '}
      · {formatPlace(flow.location)} ·{' '}
      {formatBytes(flow.bytesIn + flow.bytesOut)}
    </Text>
  </button>
);

export const NetworkMapComponent = () => {
  const [data, setData] = useState<ConnectionMapResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processFilter, setProcessFilter] = useState<string>(ALL_PROCESSES);
  const [direction, setDirection] = useState<DirectionFilter>(
    DIRECTION_FILTER.ALL,
  );
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [windowKey, setWindowKey] =
    useState<ConnectionMapWindow>(DEFAULT_WINDOW);
  const latestWindowKey = useRef(windowKey);

  const fetchConnections = async (key: ConnectionMapWindow) => {
    try {
      const params = new URLSearchParams({
        [CONNECTION_MAP_WINDOW_PARAM]: key,
      });
      const res = await authFetch(
        `${API_ENDPOINTS.NETWORK_MONITOR_CONNECTION_MAP}?${params}`,
      );
      if (!res.ok) throw new Error(FETCH_ERROR);
      const body: ConnectionMapResponse = await res.json();
      // A slow response for a previously selected window must not overwrite
      // the current one.
      if (key !== latestWindowKey.current) return;
      setData(body);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : FETCH_ERROR);
    }
  };

  usePollingInterval(() => fetchConnections(windowKey), POLL_MS);

  const handleWindowChange = (key: ConnectionMapWindow) => {
    latestWindowKey.current = key;
    setWindowKey(key);
    fetchConnections(key);
  };

  const flows = useMemo(
    () =>
      (data?.flows ?? []).filter(
        f =>
          (direction === DIRECTION_FILTER.ALL || f.direction === direction) &&
          (processFilter === ALL_PROCESSES || f.process === processFilter),
      ),
    [data, direction, processFilter],
  );
  const destinations = useMemo(() => groupByDestination(flows), [flows]);
  const processOptions = useMemo(
    () => [
      ALL_PROCESSES,
      ...[...new Set((data?.flows ?? []).map(f => f.process))].sort(),
    ],
    [data],
  );

  const highlightedKeys = useMemo(() => {
    if (!selectedFlowId) return null;
    const keys = destinations
      .filter(d => d.flows.some(f => f.id === selectedFlowId))
      .map(d => d.key);
    return keys.length ? new Set(keys) : null;
  }, [destinations, selectedFlowId]);

  if (!data && !error) return <CardSkeleton title={TITLE} rows={6} />;

  if (!data) {
    return (
      <CardContainer title={TITLE}>
        <Text color="red">{error}</Text>
      </CardContainer>
    );
  }

  const countries = new Set(
    flows.map(f => f.location?.countryCode).filter(Boolean),
  ).size;
  const unlocated = flows.filter(f => !f.location).length;
  const geoMessage = GEO_STATUS_MESSAGE[data.geoStatus];

  return (
    <CardContainer
      title={`${TITLE} (${flows.length} flows, ${destinations.length} locations, ${countries} countries)`}
    >
      <div className="flex flex-wrap items-center gap-2">
        {Object.values(DIRECTION_FILTER).map(value => (
          <Button
            key={value}
            size="xs"
            variant={direction === value ? 'default' : 'outline'}
            onClick={() => setDirection(value)}
          >
            {value}
          </Button>
        ))}
        <Select
          value={processFilter}
          onValueChange={setProcessFilter}
          options={processOptions}
          aria-label="Process"
          className="w-56"
        />
        <Select
          value={windowKey}
          onValueChange={handleWindowChange}
          options={WINDOW_OPTIONS}
          aria-label="Time window"
          className="w-24"
        />
        {error && (
          <Text size="1" color="red">
            {error}
          </Text>
        )}
        {data.collectorError && (
          <Text size="1" color="red">
            {COLLECTOR_ERROR_PREFIX}
            {data.collectorError}
          </Text>
        )}
      </div>
      {geoMessage && (
        <Text size="1" color="gray">
          {geoMessage}
        </Text>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-[480px]">
          <ConnectionWorldMap
            home={data.home}
            destinations={destinations}
            highlightedKeys={highlightedKeys}
            now={data.sampledAt}
            fadeWindowMs={CONNECTION_MAP_WINDOW[windowKey]}
          />
        </div>
        <div className="h-[480px] overflow-y-auto flex flex-col gap-0.5">
          {flows.length === 0 && (
            <Text size="2" color="gray">
              {EMPTY_MESSAGE}
            </Text>
          )}
          {flows.map(flow => (
            <FlowRow
              key={flow.id}
              flow={flow}
              now={data.sampledAt}
              selected={flow.id === selectedFlowId}
              onSelect={() =>
                setSelectedFlowId(id => (id === flow.id ? null : flow.id))
              }
            />
          ))}
          {unlocated > 0 && data.geoStatus === GEO_STATUS.READY && (
            <Text size="1" color="gray" className="px-2 pt-2">
              {unlocated} flow{unlocated === 1 ? '' : 's'} without a known
              location
            </Text>
          )}
        </div>
      </div>
    </CardContainer>
  );
};
