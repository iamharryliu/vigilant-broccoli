'use client';

import { Text, Badge, Button, Dialog } from '@radix-ui/themes';
import {
  CardContainer,
  StatusCardList,
  StatusCardListItem,
} from '@vigilant-broccoli/react-lib';
import { useCallback, useEffect, useState } from 'react';
import { CardSkeleton } from './skeleton.component';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { DEVICE_TYPE } from '../constants/network-monitor';
import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';

const TITLE = 'LAN Devices';
const REFRESH_MS = 30000;
const FETCH_ERROR = 'Failed to fetch LAN devices';
const EMPTY_MESSAGE = 'No LAN devices found';
const SCAN_BUTTON_LABEL = 'Scan';
const RESCAN_BUTTON_LABEL = 'Rescan';
const CLOSE_BUTTON_LABEL = 'Close';
const SCANNING_LABEL = 'Scanning…';
const SCAN_FAILED = 'Scan failed';
const NO_OPEN_PORTS = 'No open ports found in the top 100.';
const SCAN_HINT = 'TCP connect scan, top 100 ports. Takes a few seconds.';
const UNKNOWN_VENDOR = 'Unknown vendor';
const PORT_STATE_OPEN = 'open';

interface LanDevice {
  ip: string;
  mac: string;
  hostname: string | null;
  iface: string;
  vendor: string | null;
  deviceType: string;
  isGateway: boolean;
  isPrivacyMac: boolean;
}

interface ScannedPort {
  port: number;
  state: string;
  service: string;
}

interface ScanState {
  loading: boolean;
  error: string | null;
  ports: ScannedPort[] | null;
}

const deviceTypeColor = (d: LanDevice): 'green' | 'purple' | 'gray' => {
  if (d.isGateway) return 'green';
  if (d.isPrivacyMac) return 'gray';
  if (d.deviceType === DEVICE_TYPE.UNKNOWN) return 'gray';
  return 'purple';
};

const ScanDialog = ({ device }: { device: LanDevice }) => {
  const [state, setState] = useState<ScanState>({
    loading: false,
    error: null,
    ports: null,
  });

  const runScan = useCallback(async () => {
    setState({ loading: true, error: null, ports: null });
    try {
      const res = await fetch(API_ENDPOINTS.NETWORK_MONITOR_SCAN_DEVICE, {
        method: HTTP_METHOD.POST,
        headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
        body: JSON.stringify({ ip: device.ip }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? SCAN_FAILED);
      setState({ loading: false, error: null, ports: data.ports });
    } catch (err) {
      setState({
        loading: false,
        error: err instanceof Error ? err.message : SCAN_FAILED,
        ports: null,
      });
    }
  }, [device.ip]);

  return (
    <Dialog.Root onOpenChange={open => open && !state.ports && runScan()}>
      <Dialog.Trigger>
        <Button size="1" variant="soft">
          {SCAN_BUTTON_LABEL}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="480px">
        <Dialog.Title>
          {device.hostname ?? device.ip}{' '}
          <Text size="2" color="gray" weight="regular">
            ({device.ip})
          </Text>
        </Dialog.Title>
        <div className="flex flex-col gap-2 mt-2">
          <Text size="2" color="gray">
            {device.vendor ?? UNKNOWN_VENDOR} · {device.deviceType}
          </Text>
          <Text size="1" color="gray" className="font-mono">
            MAC: {device.mac} · {device.iface}
          </Text>
          <Text size="1" color="gray">
            {SCAN_HINT}
          </Text>
          {state.loading && (
            <Text size="2" color="gray">
              {SCANNING_LABEL}
            </Text>
          )}
          {state.error && (
            <Text size="2" color="red">
              {state.error}
            </Text>
          )}
          {state.ports && state.ports.length === 0 && (
            <Text size="2" color="gray">
              {NO_OPEN_PORTS}
            </Text>
          )}
          {state.ports && state.ports.length > 0 && (
            <div className="flex flex-col gap-1 mt-2">
              {state.ports.map(p => (
                <div
                  key={p.port}
                  className="flex items-center gap-2 border rounded px-2 py-1 border-gray-200 dark:border-gray-700"
                >
                  <Badge
                    color={p.state === PORT_STATE_OPEN ? 'green' : 'gray'}
                    size="1"
                  >
                    {p.state}
                  </Badge>
                  <Text size="2" className="font-mono">
                    {p.port}/tcp
                  </Text>
                  <Text size="2" color="gray">
                    {p.service}
                  </Text>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            size="1"
            variant="soft"
            onClick={runScan}
            disabled={state.loading}
          >
            {RESCAN_BUTTON_LABEL}
          </Button>
          <Dialog.Close>
            <Button size="1" variant="soft" color="gray">
              {CLOSE_BUTTON_LABEL}
            </Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

const toItem = (d: LanDevice): StatusCardListItem => ({
  id: `${d.ip}-${d.mac}`,
  label: d.hostname ?? d.ip,
  badges: (
    <>
      <Badge color={deviceTypeColor(d)} size="1">
        {d.deviceType}
      </Badge>
      <Badge color="blue" size="1">
        {d.iface}
      </Badge>
    </>
  ),
  actions: <ScanDialog device={d} />,
  children: (
    <>
      <Text size="1" color="gray">
        IP: <Text className="font-mono">{d.ip}</Text>
      </Text>
      <Text size="1" color="gray">
        MAC: <Text className="font-mono">{d.mac}</Text>
      </Text>
      <Text size="1" color="gray">
        Vendor: {d.vendor ?? DEVICE_TYPE.UNKNOWN}
      </Text>
    </>
  ),
});

export const LanDevicesComponent = () => {
  const [devices, setDevices] = useState<LanDevice[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.NETWORK_MONITOR_LAN_DEVICES);
      if (!res.ok) throw new Error(FETCH_ERROR);
      const data = await res.json();
      setDevices(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : FETCH_ERROR);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <CardSkeleton title={TITLE} rows={3} />;

  if (error) {
    return (
      <CardContainer title={TITLE}>
        <Text color="red">{error}</Text>
      </CardContainer>
    );
  }

  return (
    <CardContainer title={`${TITLE}${devices ? ` (${devices.length})` : ''}`}>
      <StatusCardList
        items={(devices ?? []).map(toItem)}
        emptyMessage={EMPTY_MESSAGE}
      />
    </CardContainer>
  );
};
