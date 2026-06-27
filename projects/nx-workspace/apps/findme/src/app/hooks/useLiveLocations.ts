'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';

const CHANNEL_NAME = 'live-locations';
const PRESENCE_EVENT = 'presence';
const SYNC_EVENT = 'sync';
const SUBSCRIBED_STATUS = 'SUBSCRIBED';

export interface LiveUser {
  userId: string;
  lat: number | null;
  lng: number | null;
  updatedAt: number;
}

export type SharingUser = LiveUser & { lat: number; lng: number };

export const isSharingUser = (u: LiveUser): u is SharingUser =>
  u.lat !== null && u.lng !== null;

interface PresencePayload {
  lat: number | null;
  lng: number | null;
  updatedAt: number;
}

export function useLiveLocations(
  userId: string,
  lat: number | null,
  lng: number | null,
): LiveUser[] {
  const [users, setUsers] = useState<LiveUser[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const latRef = useRef<number | null>(lat);
  const lngRef = useRef<number | null>(lng);

  useEffect(() => {
    latRef.current = lat;
    lngRef.current = lng;
  }, [lat, lng]);

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
          lat: p.lat,
          lng: p.lng,
          updatedAt: p.updatedAt,
        };
      });
      setUsers(list);
    });

    channel.subscribe(status => {
      if (status !== SUBSCRIBED_STATUS) return;
      channel.track({
        lat: latRef.current,
        lng: lngRef.current,
        updatedAt: Date.now(),
      });
    });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [userId]);

  useEffect(() => {
    if (!channelRef.current) return;
    channelRef.current.track({ lat, lng, updatedAt: Date.now() });
  }, [lat, lng]);

  return users;
}
