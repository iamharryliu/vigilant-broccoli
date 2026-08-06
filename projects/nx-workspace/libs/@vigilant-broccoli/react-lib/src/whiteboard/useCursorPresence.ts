'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CONNECTION_STATUS,
  ConnectionStatus,
} from '../live-location/live-location.types';
import {
  SupabaseBroadcastLike,
  BroadcastPresenceChannel,
} from './supabase-broadcast.types';
import { WhiteboardCursor } from './whiteboard-room.types';

const PRESENCE_EVENT = 'presence';
const SYNC_EVENT = 'sync';
const BROADCAST_EVENT = 'broadcast';
const PAGEHIDE_EVENT = 'pagehide';
const CURSOR_EVENT = 'cursor';

const SUBSCRIBE_STATUS = {
  SUBSCRIBED: 'SUBSCRIBED',
  CHANNEL_ERROR: 'CHANNEL_ERROR',
  TIMED_OUT: 'TIMED_OUT',
  CLOSED: 'CLOSED',
} as const;

interface CursorPayload {
  userId: string;
  username: string;
  x: number | null;
  y: number | null;
  index: number | null;
  updatedAt: number;
}

export interface CursorPresenceState {
  cursors: WhiteboardCursor[];
  setCursorPosition: (x: number | null, y: number | null) => void;
  setTextCursorIndex: (index: number | null) => void;
  connectionStatus: ConnectionStatus;
}

// Ephemeral peer-cursor presence, independent of whatever mechanism syncs a
// room's actual content — a dedicated channel per room, broadcasting mouse
// position and text-caret index the same way for any consumer.
export function useCursorPresence(
  supabase: SupabaseBroadcastLike,
  channelName: string,
  userId: string,
  username: string,
): CursorPresenceState {
  const [cursors, setCursors] = useState<WhiteboardCursor[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    CONNECTION_STATUS.CONNECTING,
  );
  const channelRef = useRef<BroadcastPresenceChannel | null>(null);
  const usernameRef = useRef<string>(username);
  const cursorsRef = useRef<Record<string, WhiteboardCursor>>({});
  const ownCursorRef = useRef<{
    x: number | null;
    y: number | null;
    index: number | null;
  }>({ x: null, y: null, index: null });

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  useEffect(() => {
    if (!userId || !channelName) return;

    const channel = supabase.channel(channelName, {
      config: { presence: { key: userId }, broadcast: { self: false } },
    });

    channel.on(PRESENCE_EVENT, { event: SYNC_EVENT }, () => {
      const presentIds = new Set(Object.keys(channel.presenceState()));
      const prunedCursors = Object.fromEntries(
        Object.entries(cursorsRef.current).filter(([id]) => presentIds.has(id)),
      );
      cursorsRef.current = prunedCursors;
      setCursors(Object.values(prunedCursors));
    });

    channel.on(BROADCAST_EVENT, { event: CURSOR_EVENT }, message => {
      const payload = message.payload as CursorPayload;
      const existing = cursorsRef.current[payload.userId];
      if (existing && payload.updatedAt <= existing.updatedAt) return;
      cursorsRef.current = {
        ...cursorsRef.current,
        [payload.userId]: {
          userId: payload.userId,
          username: payload.username,
          x: payload.x,
          y: payload.y,
          index: payload.index,
          updatedAt: payload.updatedAt,
        },
      };
      setCursors(Object.values(cursorsRef.current));
    });

    channel.subscribe(status => {
      if (status === SUBSCRIBE_STATUS.SUBSCRIBED) {
        setConnectionStatus(CONNECTION_STATUS.CONNECTED);
        channel.track({ username: usernameRef.current });
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
      cursorsRef.current = {};
      setCursors([]);
      ownCursorRef.current = { x: null, y: null, index: null };
    };
  }, [supabase, channelName, userId]);

  const sendOwnCursor = useCallback(() => {
    channelRef.current?.send({
      type: BROADCAST_EVENT,
      event: CURSOR_EVENT,
      payload: {
        userId,
        username: usernameRef.current,
        x: ownCursorRef.current.x,
        y: ownCursorRef.current.y,
        index: ownCursorRef.current.index,
        updatedAt: Date.now(),
      },
    });
  }, [userId]);

  const setCursorPosition = useCallback(
    (x: number | null, y: number | null) => {
      ownCursorRef.current = { ...ownCursorRef.current, x, y };
      sendOwnCursor();
    },
    [sendOwnCursor],
  );

  const setTextCursorIndex = useCallback(
    (index: number | null) => {
      ownCursorRef.current = { ...ownCursorRef.current, index };
      sendOwnCursor();
    },
    [sendOwnCursor],
  );

  return { cursors, setCursorPosition, setTextCursorIndex, connectionStatus };
}
