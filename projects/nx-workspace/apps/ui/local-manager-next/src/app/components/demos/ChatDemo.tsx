'use client';

import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Button } from '@vigilant-broccoli/react-lib';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import {
  PUBLISH_ERROR_CODES,
  PublishAck,
  SOCKET_EVENTS,
} from '@vigilant-broccoli/common-js';
import {
  CHAT_APP,
  CHAT_PUBLISH_TIMEOUT_MS,
  CHAT_ROOM,
  CHAT_STATUS,
  ChatStatus,
} from '../../constants/chat';
import { useSocketWithCertTrustPrompt } from '../../hooks/useSocketWithCertTrustPrompt';
import { getSupabaseAccessToken } from '../../../../libs/auth';

const LOG_PREFIX = '[ChatDemo]';
const SENDER_PREFIX = 'user-';
const SENDER_ID_LENGTH = 4;
const ENTER_KEY = 'Enter';
const PLACEHOLDER_SENDER = '…';
const SEND_FAILED_TOAST = 'Message not sent';
const ERR_RECONNECT_TIMEOUT = 'Reconnect timeout';

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

const SOCKET_OPTIONS: Parameters<typeof useSocketWithCertTrustPrompt>[1] = {
  reconnection: true,
  // A function so every reconnect sends the current, refreshed session token.
  auth: callback => {
    void getSupabaseAccessToken().then(token => callback({ token }));
  },
};

const randomSender = () =>
  `${SENDER_PREFIX}${Math.random()
    .toString(36)
    .slice(2, 2 + SENDER_ID_LENGTH)}`;

const publish = (socket: Socket, payload: ChatPayload): Promise<PublishAck> =>
  socket.timeout(CHAT_PUBLISH_TIMEOUT_MS).emitWithAck(SOCKET_EVENTS.PUBLISH, {
    app: CHAT_APP,
    receiverId: CHAT_ROOM,
    payload,
  });

const reconnect = (socket: Socket) =>
  new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error(ERR_RECONNECT_TIMEOUT)),
      CHAT_PUBLISH_TIMEOUT_MS,
    );
    socket.once(SOCKET_EVENTS.CONNECT, () => {
      clearTimeout(timeout);
      resolve();
    });
    socket.disconnect().connect();
  });

// The server only checks the token during the handshake, so a session that
// expired on a long-lived connection needs a reconnect to present a fresh one.
// The retry waits for `connect` because Socket.IO flushes buffered emits before
// firing it: a buffered publish would beat the resubscribe in the connect
// handler, and the sender would miss its own message.
const publishWithReauth = async (socket: Socket, payload: ChatPayload) => {
  const ack = await publish(socket, payload);
  if (ack.ok || ack.code !== PUBLISH_ERROR_CODES.FORBIDDEN) return ack;
  await reconnect(socket);
  return publish(socket, payload);
};

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
  const socket = useSocketWithCertTrustPrompt(url, SOCKET_OPTIONS);

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
    if (!socket || !text || !sender || sending) return;
    setSending(true);
    setDraft('');
    try {
      const ack = await publishWithReauth(socket, {
        text,
        sender,
        ts: Date.now(),
      });
      if (!ack.ok) throw new Error(ack.code);
    } catch (err) {
      console.error(`${LOG_PREFIX} publish failed`, err);
      setDraft(text);
      toast.error(SEND_FAILED_TOAST);
    } finally {
      setSending(false);
    }
  };

  const canSend = status === CHAT_STATUS.OPEN && !sending;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
        className="h-64 overflow-y-auto rounded border border-border bg-card p-3 flex flex-col gap-2"
      >
        {messages.length === 0 ? (
          <span className="text-muted-foreground text-sm">
            No messages yet. Open this page in two browsers and say hi.
          </span>
        ) : (
          messages.map((m, i) => (
            <div key={i} className="text-sm">
              <span
                className={
                  m.sender === sender
                    ? 'font-semibold text-blue-700'
                    : 'font-semibold text-foreground'
                }
              >
                {m.sender}
              </span>
              <span className="text-muted-foreground"> · </span>
              <span>{m.text}</span>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded border border-border px-3 py-2 text-sm"
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
