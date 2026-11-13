'use client';

import { useEffect, useRef, useState } from 'react';
import {
  CONNECTION_STATUS,
  ConnectionStatus,
  LiveLocationsState,
  LiveUser,
} from './live-location.types';

const PRESENCE_EVENT = 'presence';
const SYNC_EVENT = 'sync';
const PAGEHIDE_EVENT = 'pagehide';

const SUBSCRIBE_STATUS = {
  SUBSCRIBED: 'SUBSCRIBED',
  CHANNEL_ERROR: 'CHANNEL_ERROR',
  TIMED_OUT: 'TIMED_OUT',
  CLOSED: 'CLOSED',
} as const;

interface PresencePayload {
  username: string;
  lat: number | null;
  lng: number | null;
  updatedAt: number;
}

interface PresenceChannel {
  on(
    event: typeof PRESENCE_EVENT,
    filter: { event: typeof SYNC_EVENT },
    callback: () => void,
  ): PresenceChannel;
  subscribe(callback: (status: string) => void): PresenceChannel;
  presenceState<T>(): Record<string, T[]>;
  track(payload: PresencePayload): Promise<unknown>;
  untrack(): Promise<unknown>;
}

export interface SupabaseLike {
  channel(
    name: string,
    opts: { config: { presence: { key: string } } },
  ): PresenceChannel;
  removeChannel(channel: PresenceChannel): void;
}

export function useLiveLocations(
  supabase: SupabaseLike,
  channelName: string,
  userId: string,
  username: string,
  lat: number | null,
  lng: number | null,
): LiveLocationsState {
  const [users, setUsers] = useState<LiveUser[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    CONNECTION_STATUS.CONNECTING,
  );
  const channelRef = useRef<PresenceChannel | null>(null);
  const latRef = useRef<number | null>(lat);
  const lngRef = useRef<number | null>(lng);
  const usernameRef = useRef<string>(username);

  useEffect(() => {
    latRef.current = lat;
    lngRef.current = lng;
    usernameRef.current = username;
  }, [lat, lng, username]);

  useEffect(() => {
    if (!userId || !channelName) return;

    const channel = supabase.channel(channelName, {
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
  }, [supabase, channelName, userId]);

  useEffect(() => {
    if (!channelRef.current) return;
    channelRef.current.track({ username, lat, lng, updatedAt: Date.now() });
  }, [username, lat, lng]);

  return { users, connectionStatus };
}
