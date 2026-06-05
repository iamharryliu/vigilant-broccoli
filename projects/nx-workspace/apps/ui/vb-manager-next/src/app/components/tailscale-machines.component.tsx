'use client';

import { Text, Badge } from '@radix-ui/themes';
import {
  BORDER_ACTIVE,
  CardContainer,
  StatusCardList,
  StatusCardListItem,
} from '@vigilant-broccoli/react-lib';
import { useEffect, useState } from 'react';
import { CardSkeleton } from './skeleton.component';
import { API_ENDPOINTS } from '../constants/api-endpoints';

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

const formatLastSeen = (iso: string): string => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / MS_PER_MIN);
  if (mins < 1) return 'just now';
  if (mins < MINS_PER_HOUR) return `${mins}m ago`;
  const hours = Math.floor(mins / MINS_PER_HOUR);
  if (hours < HOURS_PER_DAY) return `${hours}h ago`;
  return `${Math.floor(hours / HOURS_PER_DAY)}d ago`;
};

const toItem = (m: TailscaleMachine): StatusCardListItem => ({
  id: m.id,
  label: m.name,
  borderClassName: m.online ? BORDER_ACTIVE : undefined,
  badges: (
    <>
      <Badge color={m.online ? 'green' : 'gray'} size="1">
        {m.online ? 'Online' : 'Offline'}
      </Badge>
      <Badge color="blue" size="1">
        {m.os}
      </Badge>
      {m.isCurrent && (
        <Badge color="purple" size="1">
          This machine
        </Badge>
      )}
      {!m.authorized && (
        <Badge color="red" size="1">
          Unauthorized
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
});

export const TailscaleMachinesComponent = () => {
  const [machines, setMachines] = useState<TailscaleMachine[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.TAILSCALE_MACHINES);
        if (!response.ok) throw new Error(ERR_FETCH_FAILED);
        const data = await response.json();
        setMachines(data.machines ?? []);
        setError(null);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : ERR_FETCH_FAILED);
        setLoading(false);
        console.error(ERR_FETCH_FAILED, err);
      }
    };

    fetchMachines();
    const interval = setInterval(fetchMachines, REFRESH_MS);
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
    <CardContainer title={TITLE}>
      <StatusCardList
        items={(machines ?? []).map(toItem)}
        emptyMessage={EMPTY_MESSAGE}
      />
    </CardContainer>
  );
};
