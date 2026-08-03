'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CONNECTION_STATUS,
  ConnectionStatus,
} from '../live-location/live-location.types';
import {
  WhiteboardCursor,
  WhiteboardMember,
  WhiteboardRoomState,
} from './whiteboard-room.types';

const PRESENCE_EVENT = 'presence';
const SYNC_EVENT = 'sync';
const BROADCAST_EVENT = 'broadcast';
const PAGEHIDE_EVENT = 'pagehide';

const CONTENT_EVENT = 'content';
const REQUEST_STATE_EVENT = 'request-state';
const CURSOR_EVENT = 'cursor';

const SUBSCRIBE_STATUS = {
  SUBSCRIBED: 'SUBSCRIBED',
  CHANNEL_ERROR: 'CHANNEL_ERROR',
  TIMED_OUT: 'TIMED_OUT',
  CLOSED: 'CLOSED',
} as const;

interface PresencePayload {
  username: string;
}

interface ContentPayload {
  content: string;
  updatedAt: number;
}

interface CursorPayload {
  userId: string;
  username: string;
  x: number | null;
  y: number | null;
  updatedAt: number;
}

interface BroadcastChannel {
  on(
    event: typeof PRESENCE_EVENT,
    filter: { event: typeof SYNC_EVENT },
    callback: () => void,
  ): BroadcastChannel;
  on(
    event: typeof BROADCAST_EVENT,
    filter: { event: string },
    callback: (message: { payload: unknown }) => void,
  ): BroadcastChannel;
  subscribe(callback: (status: string) => void): BroadcastChannel;
  presenceState<T>(): Record<string, T[]>;
  track(payload: PresencePayload): Promise<unknown>;
  untrack(): Promise<unknown>;
  send(message: {
    type: typeof BROADCAST_EVENT;
    event: string;
    payload: unknown;
  }): Promise<unknown>;
}

export interface SupabaseBroadcastLike {
  channel(
    name: string,
    opts: {
      config: { presence: { key: string }; broadcast: { self: boolean } };
    },
  ): BroadcastChannel;
  removeChannel(channel: BroadcastChannel): void;
}

export function useWhiteboardRoom(
  supabase: SupabaseBroadcastLike,
  channelName: string,
  userId: string,
  username: string,
): WhiteboardRoomState {
  const [content, setContentState] = useState('');
  const [members, setMembers] = useState<WhiteboardMember[]>([]);
  const [cursors, setCursors] = useState<WhiteboardCursor[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    CONNECTION_STATUS.CONNECTING,
  );
  const channelRef = useRef<BroadcastChannel | null>(null);
  const usernameRef = useRef<string>(username);
  const updatedAtRef = useRef<number>(0);
  const contentRef = useRef<string>('');
  const cursorsRef = useRef<Record<string, WhiteboardCursor>>({});

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  useEffect(() => {
    if (!userId || !channelName) return;

    const channel = supabase.channel(channelName, {
      config: { presence: { key: userId }, broadcast: { self: false } },
    });

    channel.on(PRESENCE_EVENT, { event: SYNC_EVENT }, () => {
      const state = channel.presenceState<PresencePayload>();
      const list: WhiteboardMember[] = Object.entries(state).map(
        ([key, presences]) => ({
          userId: key,
          username: presences[0]?.username ?? key,
        }),
      );
      setMembers(list);

      const presentIds = new Set(list.map(member => member.userId));
      const prunedCursors = Object.fromEntries(
        Object.entries(cursorsRef.current).filter(([id]) => presentIds.has(id)),
      );
      cursorsRef.current = prunedCursors;
      setCursors(Object.values(prunedCursors));
    });

    channel.on(BROADCAST_EVENT, { event: CONTENT_EVENT }, message => {
      const payload = message.payload as ContentPayload;
      if (payload.updatedAt <= updatedAtRef.current) return;
      updatedAtRef.current = payload.updatedAt;
      contentRef.current = payload.content;
      setContentState(payload.content);
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
          updatedAt: payload.updatedAt,
        },
      };
      setCursors(Object.values(cursorsRef.current));
    });

    channel.on(BROADCAST_EVENT, { event: REQUEST_STATE_EVENT }, () => {
      if (updatedAtRef.current === 0) return;
      channel.send({
        type: BROADCAST_EVENT,
        event: CONTENT_EVENT,
        payload: {
          content: contentRef.current,
          updatedAt: updatedAtRef.current,
        },
      });
    });

    channel.subscribe(status => {
      if (status === SUBSCRIBE_STATUS.SUBSCRIBED) {
        setConnectionStatus(CONNECTION_STATUS.CONNECTED);
        channel.track({ username: usernameRef.current });
        channel.send({
          type: BROADCAST_EVENT,
          event: REQUEST_STATE_EVENT,
          payload: {},
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
      updatedAtRef.current = 0;
      contentRef.current = '';
      setContentState('');
      cursorsRef.current = {};
      setCursors([]);
    };
  }, [supabase, channelName, userId]);

  const setContent = useCallback((next: string) => {
    setContentState(next);
    contentRef.current = next;
    const updatedAt = Date.now();
    updatedAtRef.current = updatedAt;
    channelRef.current?.send({
      type: BROADCAST_EVENT,
      event: CONTENT_EVENT,
      payload: { content: next, updatedAt },
    });
  }, []);

  const setCursorPosition = useCallback(
    (x: number | null, y: number | null) => {
      channelRef.current?.send({
        type: BROADCAST_EVENT,
        event: CURSOR_EVENT,
        payload: {
          userId,
          username: usernameRef.current,
          x,
          y,
          updatedAt: Date.now(),
        },
      });
    },
    [userId],
  );

  return {
    content,
    setContent,
    members,
    cursors,
    setCursorPosition,
    connectionStatus,
  };
}
