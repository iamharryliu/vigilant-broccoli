'use client';

import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '@vigilant-broccoli/common-js';
import {
  CHAT_STATUS,
  ChatPayload,
  ChatRoomMessage,
  ChatStatus,
} from './chat-room.consts';

const LOG_PREFIX = '[useChatRoom]';

export interface UseChatRoomOptions {
  // The caller owns the socket (connection options, auth, cert prompts) so
  // apps keep their own transport concerns out of this hook.
  socket: Socket | null;
  app: string;
  room: string;
  // False when the app has no socket server URL: the room reports closed
  // instead of connecting forever.
  configured?: boolean;
}

export function useChatRoom({
  socket,
  app,
  room,
  configured = true,
}: UseChatRoomOptions) {
  const [messages, setMessages] = useState<ChatPayload[]>([]);
  const [status, setStatus] = useState<ChatStatus>(CHAT_STATUS.CONNECTING);

  useEffect(() => {
    if (!configured) {
      setStatus(CHAT_STATUS.CLOSED);
      return;
    }
    if (!socket) return;
    const onConnect = () => {
      setStatus(CHAT_STATUS.OPEN);
      socket.emit(SOCKET_EVENTS.SUBSCRIBE, { app, receiverId: room });
    };
    const onDisconnect = () => setStatus(CHAT_STATUS.CLOSED);
    const onConnectError = (err: Error) => {
      console.error(`${LOG_PREFIX} connect_error`, err.message, err);
    };
    const onMessage = (msg: ChatRoomMessage) => {
      if (msg.app !== app || msg.receiverId !== room) return;
      setMessages(prev => [...prev, msg.payload]);
    };
    // Named handlers so cleanup leaves the caller's own listeners attached.
    socket.on(SOCKET_EVENTS.CONNECT, onConnect);
    socket.on(SOCKET_EVENTS.DISCONNECT, onDisconnect);
    socket.on(SOCKET_EVENTS.CONNECT_ERROR, onConnectError);
    socket.on(SOCKET_EVENTS.MESSAGE, onMessage);
    if (socket.connected) onConnect();
    return () => {
      socket.off(SOCKET_EVENTS.CONNECT, onConnect);
      socket.off(SOCKET_EVENTS.DISCONNECT, onDisconnect);
      socket.off(SOCKET_EVENTS.CONNECT_ERROR, onConnectError);
      socket.off(SOCKET_EVENTS.MESSAGE, onMessage);
    };
  }, [socket, app, room, configured]);

  return { status, messages };
}
