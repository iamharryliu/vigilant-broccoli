'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';

const CHANNEL_NAME = 'live-locations';
const PRESENCE_EVENT = 'presence';
const SYNC_EVENT = 'sync';
const PAGEHIDE_EVENT = 'pagehide';

const SUBSCRIBE_STATUS = {
  SUBSCRIBED: 'SUBSCRIBED',
  CHANNEL_ERROR: 'CHANNEL_ERROR',
  TIMED_OUT: 'TIMED_OUT',
  CLOSED: 'CLOSED',
} as const;

export const CONNECTION_STATUS = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
} as const;

export type ConnectionStatus =
  (typeof CONNECTION_STATUS)[keyof typeof CONNECTION_STATUS];

export interface LiveUser {
  userId: string;
  username: string;
  lat: number | null;
  lng: number | null;
  updatedAt: number;
}

export type SharingUser = LiveUser & { lat: number; lng: number };

export const isSharingUser = (u: LiveUser): u is SharingUser =>
  u.lat !== null && u.lng !== null;

interface PresencePayload {
  username: string;
  lat: number | null;
  lng: number | null;
  updatedAt: number;
}

export interface LiveLocationsState {
  users: LiveUser[];
  connectionStatus: ConnectionStatus;
}

export function useLiveLocations(
  userId: string,
  username: string,
  lat: number | null,
  lng: number | null,
): LiveLocationsState {
  const [users, setUsers] = useState<LiveUser[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    CONNECTION_STATUS.CONNECTING,
  );
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const latRef = useRef<number | null>(lat);
  const lngRef = useRef<number | null>(lng);
  const usernameRef = useRef<string>(username);

  useEffect(() => {
    latRef.current = lat;
    lngRef.current = lng;
    usernameRef.current = username;
  }, [lat, lng, username]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !userId) return;

    const channel = supabase.channel(CHANNEL_NAME, {
      config: { presence: { key: userId } },
    });

    channel.on(PRESENCE_EVENT, { event: SYNC_EVENT }, () => {
      const state = channel.presenceState<PresencePayload>();
      const list: LiveUser[] = Object.entries(state).map(([key, presences]) => {
        const p = presences.reduce((a, b) =>
          b.updatedAt > a.updatedAt ? b : a,
        );
        return {
          userId: key,
          username: p.username,
          lat: p.lat,
          lng: p.lng,
          updatedAt: p.updatedAt,
        };
      });
      setUsers(list);
    });

    channel.subscribe(status => {
      if (status === SUBSCRIBE_STATUS.SUBSCRIBED) {
        setConnectionStatus(CONNECTION_STATUS.CONNECTED);
        channel.track({
          username: usernameRef.current,
          lat: latRef.current,
          lng: lngRef.current,
          updatedAt: Date.now(),
        });
        return;
      }
      if (
        status === SUBSCRIBE_STATUS.CHANNEL_ERROR ||
        status === SUBSCRIBE_STATUS.TIMED_OUT
      ) {
        setConnectionStatus(CONNECTION_STATUS.ERROR);
      }
    });

    channelRef.current = channel;

    const handlePageHide = () => {
      channel.untrack();
    };
    window.addEventListener(PAGEHIDE_EVENT, handlePageHide);

    return () => {
      window.removeEventListener(PAGEHIDE_EVENT, handlePageHide);
      channel.untrack();
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [userId]);

  useEffect(() => {
    if (!channelRef.current) return;
    channelRef.current.track({ username, lat, lng, updatedAt: Date.now() });
  }, [username, lat, lng]);

  return { users, connectionStatus };
}
