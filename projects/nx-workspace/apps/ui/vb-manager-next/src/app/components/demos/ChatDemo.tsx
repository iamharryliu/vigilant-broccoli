'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@vigilant-broccoli/react-lib';
import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import {
  CHAT_APP,
  CHAT_ROOM,
  CHAT_STATUS,
  ChatStatus,
  SOCKET_EVENTS,
} from '../../constants/chat';
import { useSocketWithCertTrustPrompt } from '../../hooks/useSocketWithCertTrustPrompt';
import { authFetch } from '../../../../libs/auth';

const LOG_PREFIX = '[ChatDemo]';
const SENDER_PREFIX = 'user-';
const SENDER_ID_LENGTH = 4;
const ENTER_KEY = 'Enter';
const PLACEHOLDER_SENDER = '…';

interface ChatPayload {
  text: string;
  sender: string;
  ts: number;
}

interface ChatMessage {
  app: string;
  receiverId: string;
  payload: ChatPayload;
}

const randomSender = () =>
  `${SENDER_PREFIX}${Math.random()
    .toString(36)
    .slice(2, 2 + SENDER_ID_LENGTH)}`;

export function ChatDemo() {
  const [messages, setMessages] = useState<ChatPayload[]>([]);
  const [draft, setDraft] = useState('');
  const [sender, setSender] = useState('');
  const [status, setStatus] = useState<ChatStatus>(CHAT_STATUS.CONNECTING);
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSender(randomSender());
  }, []);

  const url = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
  const socket = useSocketWithCertTrustPrompt(url, { reconnection: true });

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

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const send = async () => {
    const text = draft.trim();
    if (!text || !sender || sending) return;
    setSending(true);
    setDraft('');
    try {
      const res = await authFetch(API_ENDPOINTS.CHAT_PUBLISH, {
        method: HTTP_METHOD.POST,
        headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
        body: JSON.stringify({ text, sender }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error(`${LOG_PREFIX} publish failed`, err);
      }
    } finally {
      setSending(false);
    }
  };

  const canSend = status === CHAT_STATUS.OPEN && !sending;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>
          You: <strong>{sender || PLACEHOLDER_SENDER}</strong>
        </span>
        <span>·</span>
        <span>
          Status: <strong>{status}</strong>
        </span>
      </div>
      <div
        ref={listRef}
        className="h-64 overflow-y-auto rounded border border-gray-300 bg-white p-3 flex flex-col gap-2"
      >
        {messages.length === 0 ? (
          <span className="text-gray-400 text-sm">
            No messages yet. Open this page in two browsers and say hi.
          </span>
        ) : (
          messages.map((m, i) => (
            <div key={i} className="text-sm">
              <span
                className={
                  m.sender === sender
                    ? 'font-semibold text-blue-700'
                    : 'font-semibold text-gray-800'
                }
              >
                {m.sender}
              </span>
              <span className="text-gray-500"> · </span>
              <span>{m.text}</span>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === ENTER_KEY) send();
          }}
          placeholder="Type a message…"
          disabled={!canSend}
        />
        <Button onClick={send} disabled={!canSend || !draft.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}
