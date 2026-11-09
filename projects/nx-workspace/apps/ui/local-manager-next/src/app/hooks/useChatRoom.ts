'use client';

import { useEffect, useState } from 'react';
import { SOCKET_EVENTS } from '@vigilant-broccoli/common-js';
import {
  CHAT_APP,
  CHAT_ROOM,
  CHAT_STATUS,
  ChatPayload,
  ChatStatus,
} from '../constants/chat';
import { useSocketWithCertTrustPrompt } from './useSocketWithCertTrustPrompt';

const LOG_PREFIX = '[useChatRoom]';

interface ChatMessage {
  app: string;
  receiverId: string;
  payload: ChatPayload;
}

export function useChatRoom(
  options: Parameters<typeof useSocketWithCertTrustPrompt>[1],
) {
  const [messages, setMessages] = useState<ChatPayload[]>([]);
  const [status, setStatus] = useState<ChatStatus>(CHAT_STATUS.CONNECTING);

  const url = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
  const socket = useSocketWithCertTrustPrompt(url, options);

  useEffect(() => {
    if (!url) {
      setStatus(CHAT_STATUS.CLOSED);
      return;
    }
    if (!socket) return;
    socket.on(SOCKET_EVENTS.CONNECT, () => {
      setStatus(CHAT_STATUS.OPEN);
      socket.emit(SOCKET_EVENTS.SUBSCRIBE, {
        app: CHAT_APP,
        receiverId: CHAT_ROOM,
      });
    });
    socket.on(SOCKET_EVENTS.DISCONNECT, () => setStatus(CHAT_STATUS.CLOSED));
    socket.on(SOCKET_EVENTS.CONNECT_ERROR, err => {
      console.error(`${LOG_PREFIX} connect_error`, err.message, err);
    });
    socket.on(SOCKET_EVENTS.MESSAGE, (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg.payload]);
    });
    return () => {
      socket.off(SOCKET_EVENTS.CONNECT);
      socket.off(SOCKET_EVENTS.DISCONNECT);
      socket.off(SOCKET_EVENTS.CONNECT_ERROR);
      socket.off(SOCKET_EVENTS.MESSAGE);
    };
  }, [url, socket]);

  return { socket, status, messages };
}
