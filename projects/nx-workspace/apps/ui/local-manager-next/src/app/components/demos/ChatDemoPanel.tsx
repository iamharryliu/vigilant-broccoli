'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Text } from '@vigilant-broccoli/react-lib';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import { CHAT_STATUS, ChatPayload, ChatStatus } from '../../constants/chat';

const LOG_PREFIX = '[ChatDemo]';
const SENDER_PREFIX = 'user-';
const SENDER_ID_LENGTH = 4;
const ENTER_KEY = 'Enter';
const PLACEHOLDER_SENDER = '…';
const SEND_FAILED_TOAST = 'Message not sent';

const randomSender = () =>
  `${SENDER_PREFIX}${Math.random()
    .toString(36)
    .slice(2, 2 + SENDER_ID_LENGTH)}`;

interface ChatDemoPanelProps {
  description: string;
  status: ChatStatus;
  messages: ChatPayload[];
  onSend: (payload: ChatPayload) => Promise<void>;
}

export function ChatDemoPanel({
  description,
  status,
  messages,
  onSend,
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
      await onSend({ text, sender, ts: Date.now() });
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
      <Text size="2" color="gray">
        {description}
      </Text>
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
