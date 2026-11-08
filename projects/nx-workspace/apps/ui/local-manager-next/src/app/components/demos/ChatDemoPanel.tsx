'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@vigilant-broccoli/react-lib';
import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { CHAT_STATUS, ChatPayload, ChatStatus } from '../../constants/chat';
import { authFetch } from '../../../../libs/auth';

const LOG_PREFIX = '[ChatDemo]';
const SENDER_PREFIX = 'user-';
const SENDER_ID_LENGTH = 4;
const ENTER_KEY = 'Enter';
const PLACEHOLDER_SENDER = '…';

const randomSender = () =>
  `${SENDER_PREFIX}${Math.random()
    .toString(36)
    .slice(2, 2 + SENDER_ID_LENGTH)}`;

interface ChatDemoPanelProps {
  status: ChatStatus;
  messages: ChatPayload[];
  publishEndpoint: string;
}

export function ChatDemoPanel({
  status,
  messages,
  publishEndpoint,
}: ChatDemoPanelProps) {
  const [draft, setDraft] = useState('');
  const [sender, setSender] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSender(randomSender());
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const send = async () => {
    const text = draft.trim();
    if (!text || !sender || sending) return;
    setSending(true);
    setDraft('');
    try {
      const res = await authFetch(publishEndpoint, {
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
