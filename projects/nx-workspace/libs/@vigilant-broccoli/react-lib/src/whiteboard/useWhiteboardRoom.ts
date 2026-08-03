'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
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

const YJS_UPDATE_EVENT = 'yjs-update';
const REQUEST_STATE_EVENT = 'request-state';
const CURSOR_EVENT = 'cursor';
const YJS_TEXT_NAME = 'content';
const REMOTE_UPDATE_ORIGIN = 'remote';

const SUBSCRIBE_STATUS = {
  SUBSCRIBED: 'SUBSCRIBED',
  CHANNEL_ERROR: 'CHANNEL_ERROR',
  TIMED_OUT: 'TIMED_OUT',
  CLOSED: 'CLOSED',
} as const;

interface PresencePayload {
  username: string;
}

interface YjsUpdatePayload {
  update: string;
}

interface CursorPayload {
  userId: string;
  username: string;
  x: number | null;
  y: number | null;
  index: number | null;
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

const encodeUpdate = (update: Uint8Array): string => {
  let binary = '';
  update.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const decodeUpdate = (encoded: string): Uint8Array => {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

// Textareas only report the final string on change, so we diff it against
// the CRDT's current text to recover the minimal insert/delete op — this is
// what keeps concurrent edits at different positions from clobbering each
// other, unlike broadcasting the full string.
const applyTextDiff = (yText: Y.Text, nextValue: string) => {
  const previousValue = yText.toString();
  if (previousValue === nextValue) return;

  let start = 0;
  while (
    start < previousValue.length &&
    start < nextValue.length &&
    previousValue[start] === nextValue[start]
  ) {
    start++;
  }

  let previousEnd = previousValue.length;
  let nextEnd = nextValue.length;
  while (
    previousEnd > start &&
    nextEnd > start &&
    previousValue[previousEnd - 1] === nextValue[nextEnd - 1]
  ) {
    previousEnd--;
    nextEnd--;
  }

  yText.doc?.transact(() => {
    if (previousEnd > start) yText.delete(start, previousEnd - start);
    if (nextEnd > start) yText.insert(start, nextValue.slice(start, nextEnd));
  });
};

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
  const docRef = useRef<Y.Doc | null>(null);
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

    const doc = new Y.Doc();
    const yText = doc.getText(YJS_TEXT_NAME);
    docRef.current = doc;

    const channel = supabase.channel(channelName, {
      config: { presence: { key: userId }, broadcast: { self: false } },
    });

    const handleTextChange = () => setContentState(yText.toString());
    yText.observe(handleTextChange);

    const handleDocUpdate = (update: Uint8Array, origin: unknown) => {
      if (origin === REMOTE_UPDATE_ORIGIN) return;
      channel.send({
        type: BROADCAST_EVENT,
        event: YJS_UPDATE_EVENT,
        payload: { update: encodeUpdate(update) },
      });
    };
    doc.on('update', handleDocUpdate);

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

    channel.on(BROADCAST_EVENT, { event: YJS_UPDATE_EVENT }, message => {
      const payload = message.payload as YjsUpdatePayload;
      Y.applyUpdate(doc, decodeUpdate(payload.update), REMOTE_UPDATE_ORIGIN);
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

    channel.on(BROADCAST_EVENT, { event: REQUEST_STATE_EVENT }, () => {
      channel.send({
        type: BROADCAST_EVENT,
        event: YJS_UPDATE_EVENT,
        payload: { update: encodeUpdate(Y.encodeStateAsUpdate(doc)) },
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
      yText.unobserve(handleTextChange);
      doc.off('update', handleDocUpdate);
      doc.destroy();
      docRef.current = null;
      setContentState('');
      cursorsRef.current = {};
      setCursors([]);
      ownCursorRef.current = { x: null, y: null, index: null };
    };
  }, [supabase, channelName, userId]);

  const setContent = useCallback((next: string) => {
    const doc = docRef.current;
    if (!doc) return;
    applyTextDiff(doc.getText(YJS_TEXT_NAME), next);
  }, []);

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

  return {
    content,
    setContent,
    members,
    cursors,
    setCursorPosition,
    setTextCursorIndex,
    connectionStatus,
  };
}
