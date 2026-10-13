import type { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';

const DIRECTORY_CHANNEL = 'balloono-directory';
const PRESENCE_EVENT = 'presence';
const SYNC_EVENT = 'sync';
const SUBSCRIBED = 'SUBSCRIBED';

export interface RoomListing {
  room: string;
  hostName: string;
  players: number;
  playing: boolean;
}

// Supabase Realtime has no way to list channels, so each room's host
// advertises it as presence on one shared directory channel; a room vanishes
// from the list when its host's presence drops.
export function useRoomDirectory(
  enabled: boolean,
  userId: string,
  advertisement: RoomListing | null,
) {
  const [rooms, setRooms] = useState<RoomListing[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!enabled || !userId) return;
    const channel = supabase.channel(DIRECTORY_CHANNEL, {
      config: { presence: { key: userId } },
    });
    channel.on(PRESENCE_EVENT, { event: SYNC_EVENT }, () => {
      const listings = Object.values(channel.presenceState<RoomListing>())
        .map(presences => presences[0])
        .filter(listing => listing?.room);
      const unique = new Map(
        listings.map(({ room, hostName, players, playing }) => [
          room,
          { room, hostName, players, playing },
        ]),
      );
      setRooms(
        [...unique.values()].sort((a, b) => a.room.localeCompare(b.room)),
      );
    });
    channel.subscribe(status => setSubscribed(status === SUBSCRIBED));
    channelRef.current = channel;
    return () => {
      void supabase.removeChannel(channel);
      channelRef.current = null;
      setSubscribed(false);
      setRooms([]);
    };
  }, [enabled, userId]);

  const { room, hostName, players, playing } = advertisement ?? {};
  useEffect(() => {
    const channel = channelRef.current;
    if (!subscribed || !channel) return;
    if (!room) {
      void channel.untrack();
      return;
    }
    void channel.track({ room, hostName, players, playing });
  }, [subscribed, room, hostName, players, playing]);

  return rooms;
}
