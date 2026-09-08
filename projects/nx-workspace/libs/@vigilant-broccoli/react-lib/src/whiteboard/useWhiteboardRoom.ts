'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import {
  CONNECTION_STATUS,
  ConnectionStatus,
} from '../live-location/live-location.types';
import {
  BroadcastPresenceChannel,
  SupabaseBroadcastLike,
} from './supabase-broadcast.types';
import { useCursorPresence } from './useCursorPresence';
import { WhiteboardMember, WhiteboardRoomState } from './whiteboard-room.types';

const PRESENCE_EVENT = 'presence';
const SYNC_EVENT = 'sync';
const BROADCAST_EVENT = 'broadcast';
const PAGEHIDE_EVENT = 'pagehide';

const YJS_UPDATE_EVENT = 'yjs-update';
const REQUEST_STATE_EVENT = 'request-state';
const YJS_TEXT_NAME = 'content';
const REMOTE_UPDATE_ORIGIN = 'remote';
const CURSOR_CHANNEL_SUFFIX = ':cursors';
const STACK_ITEM_ADDED_EVENT = 'stack-item-added';
const STACK_ITEM_POPPED_EVENT = 'stack-item-popped';

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
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    CONNECTION_STATUS.CONNECTING,
  );
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const channelRef = useRef<BroadcastPresenceChannel | null>(null);
  const usernameRef = useRef<string>(username);
  const docRef = useRef<Y.Doc | null>(null);
  const undoManagerRef = useRef<Y.UndoManager | null>(null);

  const { cursors, setCursorPosition, setTextCursorIndex } = useCursorPresence(
    supabase,
    `${channelName}${CURSOR_CHANNEL_SUFFIX}`,
    userId,
    username,
  );

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  useEffect(() => {
    if (!userId || !channelName) return;

    const doc = new Y.Doc();
    const yText = doc.getText(YJS_TEXT_NAME);
    docRef.current = doc;

    // Tracks only this client's own edits (origin `null`, the default for
    // local transactions) — remote peers' updates are applied with
    // REMOTE_UPDATE_ORIGIN below, so undo never reverts someone else's text.
    const undoManager = new Y.UndoManager(yText);
    undoManagerRef.current = undoManager;
    const handleUndoStackChange = () => {
      setCanUndo(undoManager.undoStack.length > 0);
      setCanRedo(undoManager.redoStack.length > 0);
    };
    undoManager.on(STACK_ITEM_ADDED_EVENT, handleUndoStackChange);
    undoManager.on(STACK_ITEM_POPPED_EVENT, handleUndoStackChange);

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
    });

    channel.on(BROADCAST_EVENT, { event: YJS_UPDATE_EVENT }, message => {
      const payload = message.payload as YjsUpdatePayload;
      Y.applyUpdate(doc, decodeUpdate(payload.update), REMOTE_UPDATE_ORIGIN);
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
      undoManager.off(STACK_ITEM_ADDED_EVENT, handleUndoStackChange);
      undoManager.off(STACK_ITEM_POPPED_EVENT, handleUndoStackChange);
      undoManager.destroy();
      undoManagerRef.current = null;
      doc.destroy();
      docRef.current = null;
      setContentState('');
      setCanUndo(false);
      setCanRedo(false);
    };
  }, [supabase, channelName, userId]);

  const setContent = useCallback((next: string) => {
    const doc = docRef.current;
    if (!doc) return;
    applyTextDiff(doc.getText(YJS_TEXT_NAME), next);
  }, []);

  const undo = useCallback(() => {
    undoManagerRef.current?.undo();
  }, []);

  const redo = useCallback(() => {
    undoManagerRef.current?.redo();
  }, []);

  return {
    content,
    setContent,
    members,
    cursors,
    setCursorPosition,
    setTextCursorIndex,
    connectionStatus,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
